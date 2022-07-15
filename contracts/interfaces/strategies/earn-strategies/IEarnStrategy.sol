// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEarnStrategy {
    event Deposit(uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    function deposit() external payable;

    function withdraw(address to, uint256 amount) external;

    function balanceOf() external view returns (uint256);
}
