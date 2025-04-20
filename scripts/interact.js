const hre = require("hardhat");

async function main() {

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get the Contract object
  const IdentityManagement = await hre.ethers.getContractFactory("IdentityManagement");

  // Attach to the deployed contract
  const identity = await IdentityManagement.attach(contractAddress);

  // Register a user
  const tx = await identity.register("Marjan", "marjan@example.com");
  await tx.wait();

  console.log("✅ Registration complete!");

  // Retrieve the stored data
  const [name, email, timestamp] = await identity.getMyIdentity();

  console.log("👤 Your Identity:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Registered At:", new Date(Number(timestamp) * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
