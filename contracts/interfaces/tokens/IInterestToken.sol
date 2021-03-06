// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

interface IInterestToken is IERC20, IERC20Metadata {
    event Snapshot(uint256 index, uint256 balance);
    event SetEarningsProvider(address newStrategy);

    function earningsProvider() external view returns (address);

    function balanceAtIndex() external view returns (uint256);

    function userIndex(address user) external view returns (uint256);

    function userPrincipal(address user) external view returns (uint256);

    function interestIndex() external view returns (uint256);

    function mint(address account, uint256 amount) external;

    function burnPrincipal(address account, uint256 amount) external;

    function burnInterest(address account, uint256 amount)
        external
        returns (uint256);

    function setEarningsProvider(address newStrategy) external;

    function snapshot() external;

    function calcNewIndex()
        external
        view
        returns (uint256 index, uint256 balanceCurrent);
}
