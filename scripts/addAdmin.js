// scripts/addAdmin.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const newAdminAddress = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";

  const contractABI = require("../artifacts/contracts/IdentityManagement.sol/IdentityManagement.json").abi;

  const identityContract = new hre.ethers.Contract(contractAddress, contractABI, deployer);

  const tx = await identityContract.addAdmin(newAdminAddress);
  await tx.wait();

  console.log(`✅ ${newAdminAddress} has been added as an admin.`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
