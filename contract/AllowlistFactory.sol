// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title A whitelist contract for NFT lovers
/// @author Amir Rahimi
/// @notice Read the use cases before deploying the contract
/// @dev Run test before deploying, you can find deployed contract addresses in deployed dir
contract WhitelistFactory {
    address public owner;
    uint256 private count = 0;

    struct AddressesStruct {
        address sender;
    }

    AddressesStruct[] private addresses;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }


    function addAddress() public returns (bool) {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i].sender ==  msg.sender) {
                 revert();
            }
        }
        addresses.push(AddressesStruct(msg.sender));
       return true;
    }

    
    function getAddress() public view returns (AddressesStruct[] memory) {
       return addresses;
    }

    function addressesCount() public view returns (uint256) {
        return addresses.length;
    }
}
