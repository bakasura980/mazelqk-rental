// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

interface IOwnershipToken {
    function claimable(address wallet) external view returns (uint256);

    function claim(address wallet) external returns (uint256);
}
