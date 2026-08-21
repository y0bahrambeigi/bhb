import { getAddress } from "ethers";

export const EXPECTED_CHAIN_ID = 11155111n;
export const EXPECTED_OWNER_COUNT = 5;
export const EXPECTED_THRESHOLD = 3n;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
