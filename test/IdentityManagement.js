const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityManagement with RBAC", function () {
  let identityContract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const IdentityManagement = await ethers.getContractFactory("IdentityManagement");
    identityContract = await IdentityManagement.deploy();
    await identityContract.waitForDeployment();
  });

  it("should assign admin role to deployer", async function () {
    const ADMIN_ROLE = await identityContract.DEFAULT_ADMIN_ROLE();
    expect(await identityContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
  });

  it("should grant USER_ROLE on registration", async function () {
    await identityContract.connect(user1).register("Alice", "alice@example.com");

    const USER_ROLE = await identityContract.USER_ROLE();
    expect(await identityContract.hasRole(USER_ROLE, user1.address)).to.equal(true);
  });

  it("should revert if unregistered user tries to update identity", async function () {
    await expect(
      identityContract.connect(user2).updateIdentity("Bob", "bob@example.com")
    ).to.be.revertedWithCustomError(
      identityContract,
      "AccessControlUnauthorizedAccount"
    );
  });

  it("should allow registered user to update identity", async function () {
    await identityContract.connect(user1).register("Alice", "alice@example.com");

    await expect(
      identityContract.connect(user1).updateIdentity("Alice New", "alice.new@example.com")
    ).to.not.be.reverted;
  });
});
