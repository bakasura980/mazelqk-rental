import chai from "chai";
import { ethers, run } from "hardhat";
import * as utils from "../../utils";
import { IERC20, StrategyAave } from "../../typechain";

const { expect } = chai;

let signers: any;
let strategyAave: StrategyAave;

describe("Aave Strategy", function () {
  this.timeout(60000);

  before(async function () {
    await run("compile");
  });

  utils.snapshot(async function () {
    signers = await ethers.getSigners();

    const StrategyAaveContract = await ethers.getContractFactory(
      "StrategyAave"
    );

    strategyAave = await StrategyAaveContract.deploy(
      utils.AavePoolAddress,
      utils.wethGatewayAddress,
      utils.aaveDataProviderAddress,
      utils.AaveIncentivesController,
      utils.ethAddress
    );
    await strategyAave.deployed();
    await strategyAave.transferOwnership(signers[1].address);
  });

  it("Should deposit 1 ETH", async function () {
    const deposit = ethers.utils.parseEther("1");
    const aBalanceBefore = await strategyAave.supplyBalance();

    await strategyAave.connect(signers[1]).deposit({ value: deposit });

    const aBalanceAfter = await strategyAave.supplyBalance();

    // There is immediately interest being accrued, so just round the numbers down
    expect(aBalanceBefore.add(deposit).div(1000)).to.be.equal(
      aBalanceAfter.div(1000)
    );
  });

  it("Should claim rewards", async function () {
    const aaveToken: IERC20 = await ethers.getContractAt(
      "IERC20",
      utils.AaveToken
    );

    expect(await strategyAave.canClaim()).to.be.equal(false);

    const deposit = ethers.utils.parseEther("1");
    await strategyAave.connect(signers[1]).deposit({ value: deposit });

    expect(await strategyAave.canClaim()).to.be.equal(true);

    await strategyAave.connect(signers[1]).claimRewards({
      gasLimit: 1200000,
    });

    let rewards = await aaveToken.callStatic.balanceOf(strategyAave.address);
    expect(rewards).to.be.equal(0);

    // time travel - not enough for the next claim
    await ethers.provider.send("evm_increaseTime", [12 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);

    expect(await strategyAave.canClaim()).to.be.equal(true);
    expect(await strategyAave.canRedeem()).to.be.equal(false);

    await strategyAave.connect(signers[1]).claimRewards({
      gasLimit: 1200000,
    });

    // time travel - start cooldown
    await ethers.provider.send("evm_increaseTime", [12 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);

    expect(await strategyAave.canClaim()).to.be.equal(true);
    expect(await strategyAave.canRedeem()).to.be.equal(false);

    await strategyAave.connect(signers[1]).claimRewards({
      gasLimit: 1200000,
    });

    // time travel - redeem AaveTokens from stkAave
    await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);

    expect(await strategyAave.canRedeem()).to.be.equal(true);

    const balanceBefore = await aaveToken.balanceOf(signers[1].address);
    await strategyAave.connect(signers[1]).redeemRewards({
      gasLimit: 1200000,
    });

    const balanceAfter = await aaveToken.balanceOf(signers[1].address);
    rewards = await aaveToken.callStatic.balanceOf(strategyAave.address);

    expect(rewards).to.be.equal(0);
    expect(+balanceBefore).to.be.lessThan(+balanceAfter);

    await strategyAave.connect(signers[1]).claimRewards({
      gasLimit: 1200000,
    });

    rewards = await aaveToken.balanceOf(strategyAave.address);
    expect(rewards).to.be.equal(0);
  });

  it("Should revert when claiming rewards", async function () {
    const deposit = ethers.utils.parseEther("1");
    await strategyAave.connect(signers[1]).deposit({ value: deposit });

    expect(await strategyAave.canClaim()).to.be.equal(true);

    await strategyAave.connect(signers[1]).claimRewards({
      gasLimit: 1200000,
    });

    // time travel - not enough for the next claim
    await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    expect(await strategyAave.canClaim()).to.be.equal(false);

    await expect(
      strategyAave.connect(signers[1]).claimRewards({
        gasLimit: 1200000,
      })
    ).to.be.revertedWith("SA_IN_COOLDOWN_PERIOD");
  });

  it("Should return the correct lending pool address", async function () {
    expect((await strategyAave.getLendingPool()).toLowerCase()).to.be.equal(
      utils.AavePoolAddress
    );
  });

  it("Should withdraw 1 ETH", async function () {
    const deposit = ethers.utils.parseEther("5");
    const toWithdraw = ethers.utils.parseEther("1");
    await strategyAave.connect(signers[1]).deposit({ value: deposit });

    const aBalanceBefore = await strategyAave.supplyBalance();

    await strategyAave
      .connect(signers[1])
      .withdraw(signers[1].address, toWithdraw);

    const aBalanceAfter = await strategyAave.supplyBalance();

    expect(aBalanceBefore.sub(toWithdraw).div(1000)).to.be.closeTo(
      aBalanceAfter.div(1000),
      "1000000" // interest accrual is added to aBalanceAfter so it will be bigger than 5 (deposit) - 1 (toWithdraw)
    );
  });

  it("Should withdraw all", async function () {
    const deposit = ethers.utils.parseEther("1");
    await strategyAave.connect(signers[1]).deposit({ value: deposit });

    const aBalanceBefore = await strategyAave.supplyBalance();

    await strategyAave
      .connect(signers[1])
      .withdraw(
        signers[1].address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      );

    const aBalanceAfter = await strategyAave.supplyBalance();

    expect(aBalanceBefore.sub(deposit).div(1000)).to.be.equal(
      aBalanceAfter.div(1000)
    );
  });
});
