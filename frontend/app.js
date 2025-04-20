// Configuration
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const contractABI = identityManagementABI;

// Global variables
let provider, signer, contract, currentAccount;
let isAdmin = false;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await initApplication();
});

async function initApplication() {
    initEventListeners();
    if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
    }
}

function initEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Identity management
    document.getElementById('register').addEventListener('click', registerIdentity);
    document.getElementById('get').addEventListener('click', viewIdentity);
    document.getElementById('update').addEventListener('click', updateIdentity);
    document.getElementById('deleteButton').addEventListener('click', deleteIdentity);
    
    // Admin tab handler
    const adminTab = document.getElementById('admin-tab');
    if (adminTab) {
        adminTab.addEventListener('shown.bs.tab', async () => {
            if (isAdmin) await loadAdminContent();
        });
    }
}

// Wallet Connection
async function connectWallet() {
    try {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        currentAccount = await signer.getAddress();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        updateConnectionUI();
        await checkAdminStatus();
        await viewIdentity();
        
        showToast('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error("Connection error:", error);
        showToast(error.message || "Connection failed", "danger");
    }
}

function updateConnectionUI() {
    const accountDisplay = document.getElementById('account');
    const connectBtn = document.getElementById('connect');
    
    if (accountDisplay) {
        accountDisplay.textContent = `Connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        accountDisplay.style.color = 'green';
    }
    
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="bi bi-check-circle"></i> Connected';
        connectBtn.classList.remove('btn-primary');
        connectBtn.classList.add('btn-success');
    }
}

// Identity Management Functions
async function registerIdentity() {
    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        if (!name || !email) {
            showToast('Name and email are required', 'warning');
            return;
        }
        
        const tx = await contract.registerIdentity(name, email);
        await tx.wait();
        
        showToast('Identity registered successfully!', 'success');
        await viewIdentity();
        
        // Clear form
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
    } catch (error) {
        console.error("Registration error:", error);
        showToast(error.message || "Registration failed", "danger");
    }
}

async function viewIdentity() {
    try {
        const identities = await contract.getMyIdentities();
        const container = document.getElementById('identityResult');
        
        if (identities.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> No active identities found.
                    <button class="btn btn-sm btn-primary mt-2" onclick="showRegisterForm()">
                        Register New Identity
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '<div class="row row-cols-1 row-cols-md-2 g-4">';
        identities.forEach((identity, index) => {
            html += `
                <div class="col">
                    <div class="card identity-card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">${identity.name}</h5>
                                    <p class="card-text">${identity.email}</p>
                                </div>
                                <span class="badge ${identity.verified ? 'verified-badge' : 'unverified-badge'}">
                                    ${identity.verified ? 'Verified' : 'Unverified'}
                                </span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-outline-primary me-2" 
                                onclick="fillUpdateForm('${identity.name}', '${identity.email}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" 
                                onclick="confirmDelete(${index})">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    } catch (error) {
        console.error("Error fetching identities:", error);
        showToast(error.message || "Failed to load identities", "danger");
    }


document.getElementById('update').disabled = identities.length === 0;
}

function showRegisterForm() {
    document.getElementById('name').focus();
}

function fillUpdateForm(name, email) {
    document.getElementById('newName').value = name;
    document.getElementById('newEmail').value = email;
    showToast('Form filled for update. Make your changes and click Update.', 'info');
}

async function updateIdentity() {
    try {
        const name = document.getElementById('newName').value;
        const email = document.getElementById('newEmail').value;
        
        if (!name || !email) {
            showToast('Name and email are required', 'warning');
            return;
        }

        // First check if we have any active identities
        const identities = await contract.getMyIdentities();
        if (identities.length === 0) {
            showToast('No active identities found. Please register a new one.', 'warning');
            return;
        }

        // We'll update the first active identity (index 0)
        const tx = await contract.updateIdentity(0, name, email);
        await tx.wait();
        
        showToast('Identity updated successfully!', 'success');
        await viewIdentity();
        
        // Clear form
        document.getElementById('newName').value = '';
        document.getElementById('newEmail').value = '';
    } catch (error) {
        console.error("Update error:", error);
        
        let errorMessage = "Update failed";
        if (error.message.includes("Identity deleted")) {
            errorMessage = "Cannot update deleted identity";
        } else if (error.message.includes("Invalid index")) {
            errorMessage = "Identity not found";
        }
        
        showToast(errorMessage, "danger");
    }
}

async function confirmDelete(index) {
    if (confirm('Are you sure you want to delete this identity?')) {
        await deleteIdentity(index);
    }
}

async function deleteIdentity(index) {
    try {
        const tx = await contract.deleteIdentity(index);
        await tx.wait();
        
        showToast('Identity deleted successfully!', 'success');
        await viewIdentity();
    } catch (error) {
        console.error("Deletion error:", error);
        showToast(error.message || "Deletion failed", "danger");
    }
}

// Admin Functions
async function checkAdminStatus() {
    try {
        isAdmin = await contract.isAdmin(currentAccount);
        
        if (isAdmin) {
            document.getElementById('adminStatus').classList.remove('d-none');
        }
    } catch (error) {
        console.error("Admin check failed:", error);
    }
}

async function loadAdminContent() {
    const adminTab = document.getElementById('admin');
    if (!adminTab) return;

    try {
        adminTab.innerHTML = `
            <div class="card mb-4">
                <div class="card-header">
                    <h5><i class="bi bi-people-fill"></i> Admin Controls</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6><i class="bi bi-shield-plus"></i> Manage Admins</h6>
                            <div class="input-group mb-3">
                                <input type="text" id="adminAddressInput" class="form-control" placeholder="Enter address">
                                <button id="addAdminBtn" class="btn btn-success">Add</button>
                                <button id="removeAdminBtn" class="btn btn-danger">Remove</button>
                            </div>
                        </div>
                    </div>
                    
                    <h6><i class="bi bi-search"></i> Search Identities</h6>
                    <div class="input-group mb-4">
                        <input type="text" id="adminSearchInput" class="form-control" placeholder="Search by name or address">
                        <button id="adminSearchBtn" class="btn btn-primary">Search</button>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="adminIdentitiesTable">
                                <!-- Will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for new admin elements
        document.getElementById('addAdminBtn').addEventListener('click', addAdmin);
        document.getElementById('removeAdminBtn').addEventListener('click', removeAdmin);
        document.getElementById('adminSearchBtn').addEventListener('click', adminSearch);

        await fetchAllIdentities();
    } catch (error) {
        console.error("Admin content load failed:", error);
        adminTab.innerHTML = `
            <div class="alert alert-danger">
                Failed to load admin panel
                <button class="btn btn-sm btn-warning mt-2" onclick="loadAdminContent()">Retry</button>
            </div>
        `;
    }
}

async function fetchAllIdentities() {
    try {
        const [addresses, indexes, identities] = await contract.getAllIdentities();
        const tableBody = document.getElementById('adminIdentitiesTable');
        
        tableBody.innerHTML = '';
        
        if (addresses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        No identities found in the system
                    </td>
                </tr>
            `;
            return;
        }
        
        addresses.forEach((address, i) => {
            const identity = identities[i];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${address.substring(0, 6)}...${address.substring(38)}</td>
                <td>${identity.name}</td>
                <td>${identity.email}</td>
                <td>
                    <span class="badge ${identity.verified ? 'verified-badge' : 'unverified-badge'}">
                        ${identity.verified ? 'Verified' : 'Unverified'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm ${identity.verified ? 'btn-warning' : 'btn-success'}" 
                        onclick="toggleVerification('${address}', ${indexes[i]}, ${identity.verified})">
                        ${identity.verified ? 'Unverify' : 'Verify'}
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching all identities:", error);
        showToast(error.message || "Failed to load identities", "danger");
    }
}

async function toggleVerification(address, index, isVerified) {
    try {
        if (isVerified) {
            const tx = await contract.unverifyIdentity(address, index);
            await tx.wait();
            showToast('Identity unverified', 'success');
        } else {
            const tx = await contract.verifyIdentity(address, index);
            await tx.wait();
            showToast('Identity verified', 'success');
        }
        await fetchAllIdentities();
    } catch (error) {
        console.error("Verification error:", error);
        showToast(error.message || "Verification failed", "danger");
    }
}

async function addAdmin() {
    try {
        const address = document.getElementById('adminAddressInput').value.trim();
        
        if (!ethers.utils.isAddress(address)) {
            showToast('Invalid Ethereum address', 'warning');
            return;
        }
        
        const tx = await contract.addAdmin(address);
        await tx.wait();
        
        showToast('Admin added successfully!', 'success');
        document.getElementById('adminAddressInput').value = '';
    } catch (error) {
        console.error("Add admin error:", error);
        showToast(error.message || "Failed to add admin", "danger");
    }
}

async function removeAdmin() {
    try {
        const address = document.getElementById('adminAddressInput').value.trim();
        
        if (!ethers.utils.isAddress(address)) {
            showToast('Invalid Ethereum address', 'warning');
            return;
        }
        
        const tx = await contract.removeAdmin(address);
        await tx.wait();
        
        showToast('Admin removed successfully!', 'success');
        document.getElementById('adminAddressInput').value = '';
    } catch (error) {
        console.error("Remove admin error:", error);
        showToast(error.message || "Failed to remove admin", "danger");
    }
}

async function adminSearch() {
    try {
        const searchTerm = document.getElementById('adminSearchInput').value.toLowerCase();
        const [addresses, indexes, identities] = await contract.getAllIdentities();
        const tableBody = document.getElementById('adminIdentitiesTable');
        
        tableBody.innerHTML = '';
        
        let found = false;
        
        addresses.forEach((address, i) => {
            const identity = identities[i];
            const addressStr = address.toLowerCase();
            const nameStr = identity.name.toLowerCase();
            const emailStr = identity.email.toLowerCase();
            
            if (addressStr.includes(searchTerm) || nameStr.includes(searchTerm) || emailStr.includes(searchTerm)) {
                found = true;
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${address.substring(0, 6)}...${address.substring(38)}</td>
                    <td>${identity.name}</td>
                    <td>${identity.email}</td>
                    <td>
                        <span class="badge ${identity.verified ? 'verified-badge' : 'unverified-badge'}">
                            ${identity.verified ? 'Verified' : 'Unverified'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm ${identity.verified ? 'btn-warning' : 'btn-success'}" 
                            onclick="toggleVerification('${address}', ${indexes[i]}, ${identity.verified})">
                            ${identity.verified ? 'Unverify' : 'Verify'}
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            }
        });
        
        if (!found) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        No matching identities found
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Search error:", error);
        showToast(error.message || "Search failed", "danger");
    }
}

// Utility Functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set toast color
    toast.className = `toast show bg-${type} text-white`;
    
    // Set message
    toastMessage.textContent = message;
    
    // Show toast
    toast.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

// Expose functions to window
window.fillUpdateForm = fillUpdateForm;
window.confirmDelete = confirmDelete;
window.toggleVerification = toggleVerification;
window.loadAdminContent = loadAdminContent;