import { getAddress, isHexString, keccak256 } from "ethers";

export const EXPECTED_CHAIN_ID = 11155111n;
export const EXPECTED_OWNER_COUNT = 5;
export const EXPECTED_THRESHOLD = 3n;
export const APPROVED_SAFE_VERSION = "1.5.0";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface SafeCreationEvent {
  proxy: string;
  singleton: string;
}

export function validateSafeTarget(safeInput: string, chainId: bigint, code: string): string {
  const safeAddress = getAddress(safeInput);
  if (safeInput !== safeAddress) {
    throw new Error(`Safe address must use its checksummed form: ${safeAddress}`);
  }
  if (safeAddress === ZERO_ADDRESS) {
    throw new Error("Safe address must not be the zero address.");
  }
  if (chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`Expected Sepolia chain ${EXPECTED_CHAIN_ID}, received ${chainId}.`);
  }
  if (code === "0x") {
    throw new Error(`Configured initialOwner ${safeAddress} is not a deployed Safe contract on Sepolia.`);
  }
  return safeAddress;
}

export function validateSafeGovernance(owners: string[], threshold: bigint): string[] {
  const normalizedOwners = owners.map((owner) => getAddress(owner));
  if (owners.length !== EXPECTED_OWNER_COUNT || new Set(normalizedOwners).size !== EXPECTED_OWNER_COUNT) {
    throw new Error(`Safe must contain exactly ${EXPECTED_OWNER_COUNT} distinct owners; received ${owners.length}.`);
  }
  if (threshold !== EXPECTED_THRESHOLD) {
    throw new Error(`Safe threshold must be ${EXPECTED_THRESHOLD}; received ${threshold}.`);
  }
  return normalizedOwners;
}

export function validateRegistryContract(
  label: string,
  reportedAddress: string,
  code: string,
  expectedAddress: string,
  expectedCodeHash: string,
): string {
  const normalizedAddress = getAddress(reportedAddress);
  const normalizedExpectedAddress = getAddress(expectedAddress);
  if (normalizedAddress !== normalizedExpectedAddress) {
    throw new Error(`${label} ${normalizedAddress} is not the approved Safe deployment ${normalizedExpectedAddress}.`);
  }
  if (code === "0x") {
    throw new Error(`${label} ${normalizedAddress} has no deployed bytecode.`);
  }
  const actualCodeHash = keccak256(code);
  if (actualCodeHash.toLowerCase() !== expectedCodeHash.toLowerCase()) {
    throw new Error(`${label} ${normalizedAddress} does not match the Safe deployment registry code hash.`);
  }
  return normalizedAddress;
}

export function validateSafeImplementation(
  reportedSingleton: string,
  reportedVersion: string,
  expectedSingleton: string,
  expectedVersion = APPROVED_SAFE_VERSION,
): string {
  const normalizedSingleton = getAddress(reportedSingleton);
  const normalizedExpectedSingleton = getAddress(expectedSingleton);
  if (normalizedSingleton !== normalizedExpectedSingleton) {
    throw new Error(`Safe proxy uses unapproved singleton ${normalizedSingleton}; expected ${normalizedExpectedSingleton}.`);
  }
  if (reportedVersion !== expectedVersion) {
    throw new Error(`Safe proxy reports version ${reportedVersion}; expected ${expectedVersion}.`);
  }
  return normalizedSingleton;
}

export function validateSafeCreationTransaction(transactionHash: string, status: number | null): string {
  if (!isHexString(transactionHash, 32)) {
    throw new Error("safeCreationTransactionHash must be a 32-byte transaction hash.");
  }
  if (status !== 1) {
    throw new Error("Safe creation transaction is missing or was not successful.");
  }
  return transactionHash;
}

export function validateFactoryProvenance(
  events: SafeCreationEvent[],
  safeAddress: string,
  singletonAddress: string,
): void {
  const expectedSafe = getAddress(safeAddress);
  const expectedSingleton = getAddress(singletonAddress);
  const matchingEvent = events.some((event) =>
    getAddress(event.proxy) === expectedSafe && getAddress(event.singleton) === expectedSingleton
  );
  if (!matchingEvent) {
    throw new Error("Safe creation transaction was not emitted by the approved factory for this proxy and singleton.");
  }
}
