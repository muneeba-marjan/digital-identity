const hre = require("hardhat");

async function main() {
  const IdentityManagement = await hre.ethers.getContractFactory("IdentityManagement");

  // Deploy contract
  const identity = await IdentityManagement.deploy();

  // Wait for deployment to finish
  await identity.waitForDeployment();

  // Log contract address
  console.log("Contract deployed to:", await identity.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
