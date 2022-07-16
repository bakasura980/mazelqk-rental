// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOwnershipToken is IERC20 {
    event Claim(address claimer, address to, uint256 amount);
    event ReceiveRent(uint256 newRentBalance, uint256 rentAmount);

    function rentBalance() external view returns (uint256);

    function userClaimed(address) external view returns (uint256);

    function userSnapshotTreasury(address) external view returns (uint256);

    function userSnapshotClaimable(address) external view returns (uint256);

    function snapshot(address) external;

    function claimable(address) external view returns (uint256);

    function claim(address to, uint256 amount) external;

    function receiveRent() external payable;
}
