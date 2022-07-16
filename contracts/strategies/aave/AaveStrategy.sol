// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/Aave/IWethGateway.sol";
import "../../interfaces/Aave/IStakedAToken.sol";
import "../../interfaces/Aave/IProtocolDataProvider.sol";
import "../../interfaces/Aave/IAaveIncentivesController.sol";
import "../../interfaces/strategies/earn-strategies/aave/IAaveStrategy.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StrategyAave is IAaveStrategy, Ownable {
    address private pool;
    IERC20 private aToken;
    IWETHGateway private wethGateway;
    IAaveIncentivesController private incentivesController;

    constructor(
        address _poolAddress,
        address _wethGatewayAddress,
        address _dataProviderAddress,
        address _incentivesControllerAddress
    ) Ownable() {
        pool = _poolAddress;
        wethGateway = IWETHGateway(_wethGatewayAddress);
        incentivesController = IAaveIncentivesController(
            _incentivesControllerAddress
        );

        (address _aToken, , ) = IProtocolDataProvider(_dataProviderAddress)
            .getReserveTokensAddresses(wethGateway.getWETHAddress());
        aToken = IERC20(_aToken);
    }

    function deposit() external payable override onlyOwner {
        wethGateway.depositETH{value: msg.value}(
            pool, // lending pool address
            address(this), // onBehalfOf
            0 // refferal code
        );

        emit Deposit(msg.value);
    }

    function withdraw(address to, uint256 amount) external override onlyOwner {
        aToken.approve(address(wethGateway), amount);
        wethGateway.withdrawETH(pool, amount, to);

        emit Withdraw(to, amount);
    }

    function balanceOf() public view override returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function claimRewards() external {
        require(canClaim(), "AaveStrategy: IN_COOLDOWN_PERIOD");

        address[] memory assets = new address[](1);
        assets[0] = address(aToken);

        incentivesController.claimRewards(
            assets,
            incentivesController.getRewardsBalance(assets, address(this)),
            address(this)
        );
        IStakedAave(incentivesController.REWARD_TOKEN()).cooldown();
    }

    function canClaim() public view override returns (bool) {
        IStakedAave rewardToken = IStakedAave(
            incentivesController.REWARD_TOKEN()
        );

        uint256 lastCooldown = rewardToken.stakersCooldowns(address(this));
        return
            (lastCooldown == 0 ||
                block.timestamp - lastCooldown >
                rewardToken.COOLDOWN_SECONDS() +
                    rewardToken.UNSTAKE_WINDOW()) && balanceOf() > 0;
    }

    function redeemRewards() external override onlyOwner {
        require(canRedeem(), "AaveStrategy: IN_COOLDOWN_PERIOD");

        IStakedAave stakedRewardToken = IStakedAave(
            incentivesController.REWARD_TOKEN()
        );
        IERC20 rewardToken = IERC20(stakedRewardToken.REWARD_TOKEN());

        uint256 balanceBefore = rewardToken.balanceOf(address(this));
        stakedRewardToken.redeem(msg.sender, type(uint256).max);
        uint256 balanceAfter = rewardToken.balanceOf(address(this));

        emit RedeemRewards(balanceAfter - balanceBefore);
    }

    function canRedeem() public view override returns (bool) {
        IStakedAave rewardToken = IStakedAave(
            incentivesController.REWARD_TOKEN()
        );

        uint256 lastCooldown = rewardToken.stakersCooldowns(address(this));
        return
            lastCooldown > 0 &&
            block.timestamp - lastCooldown > rewardToken.COOLDOWN_SECONDS() &&
            block.timestamp - lastCooldown <
            rewardToken.COOLDOWN_SECONDS() + rewardToken.UNSTAKE_WINDOW();
    }
}
