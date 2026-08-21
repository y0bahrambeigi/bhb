import { expect } from "chai";
import { network } from "hardhat";
import {
  EXPECTED_CHAIN_ID,
  validateSafeGovernance,
  validateSafeTarget,
} from "../tools/safe-preflight-policy.js";

describe("Sepolia Safe preflight policy", function () {
  it("accepts a checksummed deployed target with five distinct owners and threshold three", async function () {
    const { ethers } = await network.create();
    const signers = await ethers.getSigners();
    const owners = signers.slice(0, 5).map((signer) => signer.address);

    expect(validateSafeTarget(owners[0], EXPECTED_CHAIN_ID, "0x1234")).to.equal(owners[0]);
    expect(validateSafeGovernance(owners, 3n)).to.deep.equal(owners);
  });

  it("rejects a wrong chain, missing code, zero address, and non-checksummed address", async function () {
    const { ethers } = await network.create();
    const [signer] = await ethers.getSigners();

    expect(() => validateSafeTarget(signer.address, 1n, "0x1234")).to.throw("Expected Sepolia chain");
    expect(() => validateSafeTarget(signer.address, EXPECTED_CHAIN_ID, "0x")).to.throw("is not a deployed Safe contract");
    expect(() => validateSafeTarget(ethers.ZeroAddress, EXPECTED_CHAIN_ID, "0x1234")).to.throw("zero address");
    expect(() => validateSafeTarget(signer.address.toLowerCase(), EXPECTED_CHAIN_ID, "0x1234")).to.throw("checksummed form");
  });

  it("rejects duplicate owners, the wrong owner count, and the wrong threshold", async function () {
    const { ethers } = await network.create();
    const signers = await ethers.getSigners();
    const owners = signers.slice(0, 5).map((signer) => signer.address);

    expect(() => validateSafeGovernance([...owners.slice(0, 4), owners[0]], 3n)).to.throw("distinct owners");
    expect(() => validateSafeGovernance(owners.slice(0, 4), 3n)).to.throw("exactly 5");
    expect(() => validateSafeGovernance(owners, 2n)).to.throw("threshold must be 3");
  });
});
