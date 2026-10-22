import { expect } from "chai";
import { network } from "hardhat";
import {
  APPROVED_SAFE_VERSION,
  EXPECTED_CHAIN_ID,
  validateFactoryProvenance,
  validateRegistryContract,
  validateSafeCreationTransaction,
  validateSafeGovernance,
  validateSafeImplementation,
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

  it("accepts a registry-pinned Safe singleton and factory creation event", async function () {
    const { ethers } = await network.create();
    const [safe, singleton] = await ethers.getSigners();
    const runtimeCode = "0x1234";

    expect(validateRegistryContract(
      "Safe singleton",
      singleton.address,
      runtimeCode,
      singleton.address,
      ethers.keccak256(runtimeCode),
    )).to.equal(singleton.address);
    expect(validateSafeImplementation(
      singleton.address,
      APPROVED_SAFE_VERSION,
      singleton.address,
    )).to.equal(singleton.address);
    expect(validateSafeCreationTransaction(`0x${"11".repeat(32)}`, 1)).to.equal(`0x${"11".repeat(32)}`);
    expect(() => validateFactoryProvenance(
      [{ proxy: safe.address, singleton: singleton.address }],
      safe.address,
      singleton.address,
    )).not.to.throw();
  });

  it("rejects counterfeit registry code, singleton identity, and factory provenance", async function () {
    const { ethers } = await network.create();
    const [safe, singleton, counterfeit] = await ethers.getSigners();

    expect(() => validateRegistryContract(
      "Safe singleton",
      counterfeit.address,
      "0x1234",
      singleton.address,
      ethers.keccak256("0x1234"),
    )).to.throw("is not the approved Safe deployment");
    expect(() => validateRegistryContract(
      "Safe singleton",
      singleton.address,
      "0x1234",
      singleton.address,
      ethers.keccak256("0xabcd"),
    )).to.throw("registry code hash");
    expect(() => validateSafeImplementation(
      counterfeit.address,
      APPROVED_SAFE_VERSION,
      singleton.address,
    )).to.throw("unapproved singleton");
    expect(() => validateSafeImplementation(
      singleton.address,
      "1.4.1",
      singleton.address,
    )).to.throw("expected 1.5.0");
    expect(() => validateSafeCreationTransaction("0x1234", 1)).to.throw("32-byte transaction hash");
    expect(() => validateSafeCreationTransaction(`0x${"22".repeat(32)}`, 0)).to.throw("was not successful");
    expect(() => validateFactoryProvenance([], safe.address, singleton.address)).to.throw("approved factory");
    expect(() => validateFactoryProvenance(
      [{ proxy: safe.address, singleton: counterfeit.address }],
      safe.address,
      singleton.address,
    )).to.throw("approved factory");
  });
});
