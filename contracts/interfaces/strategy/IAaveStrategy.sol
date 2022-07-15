// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

interface IAaveStrategy {
    event Deposit(uint256 amount);
    event Withdraw(address indexed to, uint256 amount);
    event ClaimRewards(uint256 amount);
    event RedeemRewards(uint256 amount);

    function deposit() external payable;

    function withdraw(address to, uint256 amount) external;

    function getLendingPool() external view returns (address);

    function supplyBalance() external view returns (uint256);

    function redeemRewards() external;

    function canClaim() external view returns (bool);

    function canRedeem() external view returns (bool);
}
