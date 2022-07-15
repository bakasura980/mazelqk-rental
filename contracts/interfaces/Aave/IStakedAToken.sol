// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "./IAaveIncentivesController.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStakedAave is IERC20 {
    function stake(address to, uint256 amount) external;

    function redeem(address to, uint256 amount) external;

    function cooldown() external;

    function claimRewards(address to, uint256 amount) external;

    function REWARD_TOKEN() external view returns (address);

    function COOLDOWN_SECONDS() external view returns (uint256);

    function REWARDS_VAULT() external view returns (address);

    function STAKED_TOKEN() external view returns (address);

    function UNSTAKE_WINDOW() external view returns (uint256);

    function getTotalRewardsBalance(address) external view returns (uint256);

    function stakersCooldowns(address) external view returns (uint256);

    function stakerRewardsToClaim(address) external view returns (uint256);
}
