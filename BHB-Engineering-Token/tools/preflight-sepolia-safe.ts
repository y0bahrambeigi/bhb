import { readFile } from "node:fs/promises";
import { network } from "hardhat";
import {
  validateSafeGovernance,
  validateSafeTarget,
} from "./safe-preflight-policy.js";

const PARAMETERS_FILE = new URL("../ignition/parameters/sepolia.json", import.meta.url);
const SAFE_ABI = [
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
];

const parameters = JSON.parse(await readFile(PARAMETERS_FILE, "utf8")) as {
  BHBEngineeringTokenModule?: { initialOwner?: unknown };
};
const safeInput = parameters.BHBEngineeringTokenModule?.initialOwner;

if (typeof safeInput !== "string") {
  throw new Error("ignition/parameters/sepolia.json must define BHBEngineeringTokenModule.initialOwner.");
}

const { ethers } = await network.create();
const connectedNetwork = await ethers.provider.getNetwork();
const normalizedInput = ethers.getAddress(safeInput);
const code = await ethers.provider.getCode(normalizedInput);
const safeAddress = validateSafeTarget(safeInput, connectedNetwork.chainId, code);

const safe = new ethers.Contract(safeAddress, SAFE_ABI, ethers.provider);
const owners = await safe.getOwners() as string[];
const threshold = await safe.getThreshold() as bigint;
validateSafeGovernance(owners, threshold);

console.log(`Sepolia Safe preflight passed: ${safeAddress}, ${owners.length} owners, threshold ${threshold}.`);
