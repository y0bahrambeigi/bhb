import { expect } from "chai";
import { network } from "hardhat";
import type { BHBEngineeringToken } from "../types/ethers-contracts/index.js";

const ONE_TOKEN = 10n ** 18n;
const INITIAL_SUPPLY = 100_000_000n * ONE_TOKEN;
const ADDITIONAL_LIMIT = 20_000_000n * ONE_TOKEN;

describe("BHBEngineeringToken", function () {
  async function deployFixture() {
    const { ethers } = await network.create();
    const [owner, alice, bob] = await ethers.getSigners();
    const token = await ethers.deployContract("BHBEngineeringToken", [owner.address]) as unknown as BHBEngineeringToken;
    await token.waitForDeployment();
    return { token, owner, alice, bob };
  }

  it("sets the identity, owner, initial supply, and permanent cap", async function () {
    const { token, owner } = await deployFixture();

    expect(await token.name()).to.equal("BHB Engineering Token");
    expect(await token.symbol()).to.equal("BHB");
    expect(await token.decimals()).to.equal(18);
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    expect(await token.cap()).to.equal(INITIAL_SUPPLY + ADDITIONAL_LIMIT);
    expect(await token.remainingMintAllowance()).to.equal(ADDITIONAL_LIMIT);
  });

  it("allows ordinary ERC-20 transfers", async function () {
    const { token, owner, alice } = await deployFixture();
    const amount = 500n * ONE_TOKEN;

    await expect(token.connect(owner).transfer(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
  });

  it("lets only the owner mint within the lifetime allowance", async function () {
    const { token, owner, alice } = await deployFixture();
    const amount = 1_000_000n * ONE_TOKEN;

    await expect(token.connect(owner).mint(alice.address, amount))
      .to.emit(token, "AdditionalTokensMinted")
      .withArgs(alice.address, amount, amount);
    expect(await token.additionalMinted()).to.equal(amount);
    expect(await token.remainingMintAllowance()).to.equal(ADDITIONAL_LIMIT - amount);

    await expect(token.connect(alice).mint(alice.address, 1n))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("never permits minting beyond 20 million additional BHB", async function () {
    const { token, owner, alice } = await deployFixture();
    await token.connect(owner).mint(alice.address, ADDITIONAL_LIMIT);

    await expect(token.connect(owner).mint(alice.address, 1n))
      .to.be.revertedWithCustomError(token, "AdditionalMintAllowanceExceeded")
      .withArgs(1n, 0n);
    expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY + ADDITIONAL_LIMIT);
  });

  it("does not reopen the mint allowance when tokens are burned", async function () {
    const { token, owner } = await deployFixture();
    await token.connect(owner).mint(owner.address, ADDITIONAL_LIMIT);
    await token.connect(owner).burn(5_000_000n * ONE_TOKEN);

    expect(await token.remainingMintAllowance()).to.equal(0n);
    await expect(token.connect(owner).mint(owner.address, 1n))
      .to.be.revertedWithCustomError(token, "AdditionalMintAllowanceExceeded")
      .withArgs(1n, 0n);
  });

  it("pauses transfers, minting, and burning until the owner unpauses", async function () {
    const { token, owner, alice } = await deployFixture();
    await token.connect(owner).pause();

    await expect(token.connect(owner).transfer(alice.address, ONE_TOKEN))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
    await expect(token.connect(owner).mint(alice.address, ONE_TOKEN))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
    await expect(token.connect(owner).burn(ONE_TOKEN))
      .to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.connect(owner).unpause();
    await expect(token.connect(owner).transfer(alice.address, ONE_TOKEN))
      .to.emit(token, "Transfer");
  });

  it("uses two-step ownership transfer", async function () {
    const { token, owner, alice } = await deployFixture();
    await token.connect(owner).transferOwnership(alice.address);

    expect(await token.owner()).to.equal(owner.address);
    expect(await token.pendingOwner()).to.equal(alice.address);

    await token.connect(alice).acceptOwnership();
    expect(await token.owner()).to.equal(alice.address);
  });

  it("prevents an irreversible freeze by rejecting renunciation while paused", async function () {
    const { token, owner } = await deployFixture();
    await token.connect(owner).pause();

    await expect(token.connect(owner).renounceOwnership())
      .to.be.revertedWithCustomError(token, "CannotRenounceOwnershipWhilePaused");

    await token.connect(owner).unpause();
    await token.connect(owner).renounceOwnership();
    expect(await token.owner()).to.equal("0x0000000000000000000000000000000000000000");
  });
});
