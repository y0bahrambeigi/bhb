import { readFile } from "node:fs/promises";
import {
  getProxyFactoryDeployment,
  getSafeSingletonDeployment,
} from "@safe-global/safe-deployments";
import { network } from "hardhat";
import {
  APPROVED_SAFE_VERSION,
  EXPECTED_CHAIN_ID,
  type SafeCreationEvent,
  validateFactoryProvenance,
  validateSafeGovernance,
  validateSafeCreationTransaction,
  validateSafeImplementation,
  validateSafeTarget,
  validateRegistryContract,
} from "./safe-preflight-policy.js";

const PARAMETERS_FILE = new URL("../ignition/parameters/sepolia.json", import.meta.url);
const SAFE_ABI = [
  "function masterCopy() view returns (address)",
  "function VERSION() view returns (string)",
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
];
const FACTORY_ABI = [
  "event ProxyCreation(address indexed proxy, address singleton)",
];

const parameters = JSON.parse(await readFile(PARAMETERS_FILE, "utf8")) as {
  BHBEngineeringTokenModule?: {
    initialOwner?: unknown;
    safeCreationTransactionHash?: unknown;
  };
};
const safeInput = parameters.BHBEngineeringTokenModule?.initialOwner;
const creationTransactionHash = parameters.BHBEngineeringTokenModule?.safeCreationTransactionHash;

if (typeof safeInput !== "string") {
  throw new Error("ignition/parameters/sepolia.json must define BHBEngineeringTokenModule.initialOwner.");
}
if (typeof creationTransactionHash !== "string") {
  throw new Error("ignition/parameters/sepolia.json must define BHBEngineeringTokenModule.safeCreationTransactionHash.");
}

const { ethers } = await network.create();
const connectedNetwork = await ethers.provider.getNetwork();
const normalizedInput = ethers.getAddress(safeInput);
const code = await ethers.provider.getCode(normalizedInput);
const safeAddress = validateSafeTarget(safeInput, connectedNetwork.chainId, code);

const registryFilter = {
  network: EXPECTED_CHAIN_ID.toString(),
  version: APPROVED_SAFE_VERSION,
};
const singletonDeployment = getSafeSingletonDeployment(registryFilter);
const factoryDeployment = getProxyFactoryDeployment(registryFilter);
if (!singletonDeployment?.deployments.canonical || !factoryDeployment?.deployments.canonical) {
  throw new Error(`Safe deployment registry does not contain canonical Sepolia v${APPROVED_SAFE_VERSION} contracts.`);
}

const expectedSingleton = ethers.getAddress(singletonDeployment.deployments.canonical.address);
const expectedFactory = ethers.getAddress(factoryDeployment.deployments.canonical.address);
const singletonCode = await ethers.provider.getCode(expectedSingleton);
const factoryCode = await ethers.provider.getCode(expectedFactory);
validateRegistryContract(
  "Safe singleton",
  expectedSingleton,
  singletonCode,
  expectedSingleton,
  singletonDeployment.deployments.canonical.codeHash,
);
validateRegistryContract(
  "Safe proxy factory",
  expectedFactory,
  factoryCode,
  expectedFactory,
  factoryDeployment.deployments.canonical.codeHash,
);

const safe = new ethers.Contract(safeAddress, SAFE_ABI, ethers.provider);
const reportedSingleton = await safe.masterCopy() as string;
const reportedVersion = await safe.VERSION() as string;
const singletonAddress = validateSafeImplementation(
  reportedSingleton,
  reportedVersion,
  expectedSingleton,
);
const owners = await safe.getOwners() as string[];
const threshold = await safe.getThreshold() as bigint;
validateSafeGovernance(owners, threshold);

const receipt = await ethers.provider.getTransactionReceipt(creationTransactionHash);
validateSafeCreationTransaction(creationTransactionHash, receipt?.status ?? null);
const factoryInterface = new ethers.Interface(FACTORY_ABI);
const creationEvents: SafeCreationEvent[] = [];
for (const log of receipt?.logs ?? []) {
  if (ethers.getAddress(log.address) !== expectedFactory) continue;
  try {
    const parsed = factoryInterface.parseLog({ data: log.data, topics: [...log.topics] });
    if (parsed?.name === "ProxyCreation") {
      creationEvents.push({
        proxy: String(parsed.args.proxy),
        singleton: String(parsed.args.singleton),
      });
    }
  } catch {
    // Ignore unrelated logs from the same transaction.
  }
}
validateFactoryProvenance(creationEvents, safeAddress, singletonAddress);

console.log(
  `Sepolia Safe preflight passed: ${safeAddress}, official Safe v${reportedVersion}, ${owners.length} owners, threshold ${threshold}.`,
);
