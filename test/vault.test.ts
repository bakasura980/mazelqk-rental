import chai from "chai";
import * as utils from "../utils";
import { ethers, run } from "hardhat";
import { IERC20, StrategyAave, Vault } from "../typechain";

const { expect } = chai;

let signers: any;
let vault: Vault;
let strategyAave: StrategyAave;

describe("Vault", function () {
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
      utils.AaveIncentivesController
    );
    await strategyAave.deployed();

    vault = await (
      await (
        await ethers.getContractFactory("Vault")
      ).deploy(strategyAave.address, ethers.utils.parseEther("0.01"))
    ).deployed();

    await strategyAave.transferOwnership(vault.address);
  });

  it("Should initialize correctly", async function () {
    expect(await vault.interestToken()).to.be.not.equal(
      ethers.constants.AddressZero
    );
    expect(await vault.earningsProvider()).to.be.equal(strategyAave.address);
  });

  it("Should list a car", async function () {
    await vault.list(
      [signers[1].address, signers[2].address, signers[3].address],
      [
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("30"),
        ethers.utils.parseEther("60"),
      ],
      ethers.utils.parseEther("50"),
      "test.image.png",
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("0.05"),
      2 * 60 * 60 * 24, // 2 day for reviewing
      signers[9].address
    );

    const carData = await vault.carData(0);
    expect(carData[0]).to.be.equal(ethers.utils.parseEther("50"));
    expect(carData[1]).to.be.equal("test.image.png");
    expect(carData[2]).to.be.equal(ethers.utils.parseEther("5"));
    expect(carData[3]).to.be.equal(ethers.utils.parseEther("0.25"));
    expect(carData[4]).to.be.equal(2 * 60 * 60 * 24);
    expect(carData[5]).to.be.equal(signers[9].address);
    expect(carData[6]).to.be.not.equal(ethers.constants.AddressZero);

    expect(await vault.ownerOf(0)).to.be.equal(vault.address);
  });

  it("Should revert in case collateral is bigger then the price", async function () {
    await expect(
      vault.list(
        [signers[1].address, signers[2].address, signers[3].address],
        [
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("30"),
          ethers.utils.parseEther("60"),
        ],
        ethers.utils.parseEther("50"),
        "test.image.png",
        ethers.utils.parseEther("51"),
        ethers.utils.parseEther("0.05"),
        2 * 60 * 60 * 24, // 2 day for reviewing
        signers[9].address
      )
    ).to.be.revertedWith("COLLATERAL_MORE_THAN_PRICE");
  });

  it("Should revert in case insurance share is bigger then 1e18", async function () {
    await expect(
      vault.list(
        [signers[1].address, signers[2].address, signers[3].address],
        [
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("30"),
          ethers.utils.parseEther("60"),
        ],
        ethers.utils.parseEther("50"),
        "test.image.png",
        ethers.utils.parseEther("5"),
        ethers.utils.parseEther("100"),
        2 * 60 * 60 * 24, // 2 day for reviewing
        signers[9].address
      )
    ).to.be.revertedWith("SHARE_TOO_BIG");
  });

  it.only("Should rent a car", async function () {
    await vault.list(
      [signers[1].address, signers[2].address, signers[3].address],
      [
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("30"),
        ethers.utils.parseEther("60"),
      ],
      ethers.utils.parseEther("50"),
      "test.image.png",
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("0.05"),
      2 * 60 * 60 * 24, // 2 day for reviewing
      signers[9].address
    );

    await vault.rent(0, { value: ethers.utils.parseEther("50") });

    const carLease = await vault.carLease(0);
    expect(carLease[1]).to.be.equal(carLease[0].add(90 * 24 * 60 * 60));
    expect(carLease[2]).to.be.equal(0);
    expect(carLease[3]).to.be.equal(0); // Available
    expect(carLease[4]).to.be.equal(ethers.utils.parseEther("45")); // amount - collateral

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );
    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );

    expect(await strategyAave.balanceOf()).to.be.equal(
      ethers.utils.parseEther("5")
    );

    const carData = await vault.carData(0);
    expect(await ethers.provider.getBalance(carData[6])).to.be.equal(
      ethers.utils.parseEther("45")
    );

    expect(await vault.consumerOf(0)).to.be.equal(signers[0].address);
  });
});
