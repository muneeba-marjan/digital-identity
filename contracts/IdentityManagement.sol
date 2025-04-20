// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityManagement {
    struct Identity {
        string name;
        string email;
        bool verified;
        bool isActive;
    }

    mapping(address => Identity[]) private userIdentities;
    mapping(address => string) public roles;
    address[] private allUsers;
    address public owner;

    event IdentityRegistered(address indexed user, uint index);
    event IdentityUpdated(address indexed user, uint index);
    event IdentityDeleted(address indexed user, uint index);
    event IdentityVerified(address indexed user, uint index);
    event IdentityUnverified(address indexed user, uint index);
    event RoleChanged(address indexed account, string role);

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = "admin";
        emit RoleChanged(msg.sender, "admin");
    }

    modifier onlyAdmin() {
        require(keccak256(bytes(roles[msg.sender])) == keccak256(bytes("admin")), "Not admin");
        _;
    }

    function addAdmin(address _account) external onlyAdmin {
        roles[_account] = "admin";
        emit RoleChanged(_account, "admin");
    }

    function removeAdmin(address _account) external onlyAdmin {
        require(_account != owner, "Cannot remove owner");
        roles[_account] = "user";
        emit RoleChanged(_account, "user");
    }

    function registerIdentity(string memory _name, string memory _email) external {
        userIdentities[msg.sender].push(Identity(_name, _email, false, true));
        if (userIdentities[msg.sender].length == 1) {
            allUsers.push(msg.sender);
        }
        emit IdentityRegistered(msg.sender, userIdentities[msg.sender].length - 1);
    }

    function getMyIdentities() external view returns (Identity[] memory) {
        Identity[] memory activeIdentities = new Identity[](getActiveCount(msg.sender));
        uint counter = 0;
        for (uint i = 0; i < userIdentities[msg.sender].length; i++) {
            if (userIdentities[msg.sender][i].isActive) {
                activeIdentities[counter] = userIdentities[msg.sender][i];
                counter++;
            }
        }
        return activeIdentities;
    }

   function updateIdentity(uint _index, string memory _name, string memory _email) external {
    require(_index < userIdentities[msg.sender].length, "Invalid index");
    require(userIdentities[msg.sender][_index].isActive, "Identity deleted");
    userIdentities[msg.sender][_index].name = _name;
    userIdentities[msg.sender][_index].email = _email;
    emit IdentityUpdated(msg.sender, _index);
}

    function deleteIdentity(uint _index) external {
        require(_index < userIdentities[msg.sender].length, "Invalid index");
        require(userIdentities[msg.sender][_index].isActive, "Already deleted");
        userIdentities[msg.sender][_index].isActive = false;
        emit IdentityDeleted(msg.sender, _index);
    }

    function getAllIdentities() external view onlyAdmin returns (
        address[] memory, 
        uint[] memory, 
        Identity[] memory
    ) {
        uint total = getTotalActiveIdentities();
        address[] memory addresses = new address[](total);
        uint[] memory indexes = new uint[](total);
        Identity[] memory identities = new Identity[](total);
        
        uint counter = 0;
        for (uint i = 0; i < allUsers.length; i++) {
            for (uint j = 0; j < userIdentities[allUsers[i]].length; j++) {
                if (userIdentities[allUsers[i]][j].isActive) {
                    addresses[counter] = allUsers[i];
                    indexes[counter] = j;
                    identities[counter] = userIdentities[allUsers[i]][j];
                    counter++;
                }
            }
        }
        return (addresses, indexes, identities);
    }

    function verifyIdentity(address _user, uint _index) external onlyAdmin {
        userIdentities[_user][_index].verified = true;
        emit IdentityVerified(_user, _index);
    }

    function unverifyIdentity(address _user, uint _index) external onlyAdmin {
        userIdentities[_user][_index].verified = false;
        emit IdentityUnverified(_user, _index);
    }

    function isAdmin(address _addr) external view returns (bool) {
        return keccak256(bytes(roles[_addr])) == keccak256(bytes("admin"));
    }

    function getActiveCount(address _user) private view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userIdentities[_user].length; i++) {
            if (userIdentities[_user][i].isActive) count++;
        }
        return count;
    }

    function getTotalActiveIdentities() private view returns (uint) {
        uint total = 0;
        for (uint i = 0; i < allUsers.length; i++) {
            total += getActiveCount(allUsers[i]);
        }
        return total;
    }
}