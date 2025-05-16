# Blockchain for Secure Digital Identity Management

This project is a decentralized application (DApp) that leverages **Ethereum blockchain** to securely manage digital identities using **smart contracts** written in **Solidity** and deployed using **Hardhat**. The frontend is built with **HTML, CSS, and JavaScript**, and interacts with the Ethereum network via **ethers.js** and **MetaMask**.

---

## 🌐 Features

- ✅ Register multiple digital identities per user/address
- 🧾 View and manage all identities linked to your wallet
- ✏️ Update and delete identities (user-controlled)
- 🛡️ Role-Based Access Control (RBAC)
  - Admins can verify, revoke, and delete any identity
- 📦 Smart contract fully deployed using Hardhat
- 🔐 Frontend integration with MetaMask for wallet connection
- 📄 Pagination, filtering, and search for identity management

---

## 📁 Project Structure

contracts/
└── IdentityManagement.sol # Main smart contract

frontend/
├── index.html # UI
└── app.js # Frontend logic using ethers.js

scripts/
└── deploy.js # Deployment script

test/
└── test.js # Contract tests


---

## ⚙️ Technologies Used

- **Solidity**
- **Ethereum Blockchain**
- **Hardhat**
- **MetaMask**
- **ethers.js**
- **Node.js**
- **HTML/CSS/JavaScript**

---
