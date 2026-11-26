import { Interface, getAddress } from "ethers";

const [tokenInput, safeInput] = process.argv.slice(2);

if (!tokenInput || !safeInput) {
  console.error("Usage: npm run multisig:calldata -- <TOKEN_ADDRESS> <SAFE_ADDRESS>");
  process.exitCode = 1;
} else {
  try {
    const token = getAddress(tokenInput);
    const safe = getAddress(safeInput);
    const ownershipInterface = new Interface([
      "function transferOwnership(address newOwner)",
      "function acceptOwnership()",
    ]);

    const payload = {
      network: "sepolia",
      chainId: 11155111,
      token,
      safe,
      step1CurrentOwnerTransaction: {
        description: "Current owner nominates the Safe as pending owner",
        to: token,
        value: "0",
        data: ownershipInterface.encodeFunctionData("transferOwnership", [safe]),
      },
      step2SafeTransaction: {
        description: "Safe accepts ownership after reaching its signature threshold",
        to: token,
        value: "0",
        data: ownershipInterface.encodeFunctionData("acceptOwnership"),
      },
      verificationCalls: [
        "owner() must equal the Safe address after step 2",
        "pendingOwner() must equal the zero address after step 2",
      ],
    };

    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
