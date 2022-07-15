// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "../interfaces/strategy/IAaveStrategy.sol";

import "../interfaces/Aave/IStakedAToken.sol";
import "../interfaces/Aave/ILendingPool.sol";
import "../interfaces/Aave/IWethGateway.sol";
import "../interfaces/Aave/IProtocolDataProvider.sol";
import "../interfaces/Aave/IPriceOracle.sol";

import "../libraries/TransferHelper.sol";
import "../libraries/Errors.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StrategyAave is IAaveStrategy, Ownable {
    IAaveLendingPool private pool;
    IWETHGateway private wethGateway;
    IProtocolDataProvider private dataProvider;
    IAaveIncentivesController private incentivesController;
    address private ethAddress;

    constructor(
        address _poolAddress,
        address _wethGatewayAddress,
        address _dataProviderAddress,
        address _incentivesControllerAddress,
        address _ethAddress
    ) Ownable() {
        pool = IAaveLendingPool(_poolAddress);
        wethGateway = IWETHGateway(_wethGatewayAddress);
        dataProvider = IProtocolDataProvider(_dataProviderAddress);
        incentivesController = IAaveIncentivesController(
            _incentivesControllerAddress
        );
        ethAddress = _ethAddress;
    }

    function deposit() public payable override onlyOwner {
        wethGateway.depositETH{value: msg.value}(
            address(pool), // lending pool address
            address(this), // onBehalfOf
            0 // refferal code
        );

        emit Deposit(msg.value);
    }

    function withdraw(address to, uint256 amount) public override onlyOwner {
        address wethAddress = wethGateway.getWETHAddress();
        (address aToken, , ) = dataProvider.getReserveTokensAddresses(
            wethAddress
        );
        IERC20(aToken).approve(address(wethGateway), amount);
        wethGateway.withdrawETH(address(pool), amount, to);

        emit Withdraw(to, amount);
    }

    function getLendingPool() external view override returns (address) {
        return address(pool);
    }

    function supplyBalance() public view override returns (uint256) {
        (address aToken, , ) = dataProvider.getReserveTokensAddresses(
            ethAddress
        );

        return IERC20(aToken).balanceOf(address(this));
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
                    rewardToken.UNSTAKE_WINDOW()) && supplyBalance() > 0;
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

    function claimRewards() external {
        if (!canClaim()) {
            revert Errors.SA_IN_COOLDOWN_PERIOD();
        }

        address wethAddress = wethGateway.getWETHAddress();
        (address aSupplyToken, , ) = dataProvider.getReserveTokensAddresses(
            wethAddress
        );

        address[] memory assets = new address[](1);
        assets[0] = aSupplyToken;

        incentivesController.claimRewards(
            assets,
            incentivesController.getRewardsBalance(assets, address(this)),
            address(this)
        );
        IStakedAave(incentivesController.REWARD_TOKEN()).cooldown();
    }

    function redeemRewards() public override onlyOwner {
        if (!canRedeem()) {
            revert Errors.SA_IN_COOLDOWN_PERIOD();
        }

        IStakedAave stakedRewardToken = IStakedAave(
            incentivesController.REWARD_TOKEN()
        );
        IERC20 rewardToken = IERC20(stakedRewardToken.REWARD_TOKEN());

        uint256 balanceBefore = rewardToken.balanceOf(address(this));
        stakedRewardToken.redeem(msg.sender, type(uint256).max);
        uint256 balanceAfter = rewardToken.balanceOf(address(this));

        emit RedeemRewards(balanceAfter - balanceBefore);
    }
}
