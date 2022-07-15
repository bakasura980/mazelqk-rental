// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../IEarnStrategy.sol";

interface IAaveStrategy is IEarnStrategy {
    event ClaimRewards(uint256 amount);
    event RedeemRewards(uint256 amount);

    function redeemRewards() external;

    function canClaim() external view returns (bool);

    function canRedeem() external view returns (bool);
}
