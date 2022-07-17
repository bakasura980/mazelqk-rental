import chai from "chai";
import * as utils from "../utils";
import { ethers, run } from "hardhat";
import { Vault, StrategyAave } from "../typechain";

import { abi as VaultAbi } from "../artifacts/contracts/Vault.sol/Vault.json";

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

  it("Should rent a car", async function () {
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
    expect(carLease[3]).to.be.equal(1); // Rented
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

    expect(await vault.consumerOf(0)).to.be.equal(signers[0].address);
  });

  it("Should revert rent in case of invalid duration", async function () {
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

    await expect(
      vault.rent(0, { value: ethers.utils.parseEther("5") })
    ).to.be.revertedWith("DURATION_TOO_LOW");
  });

  it("Should revert rent in case of not available car", async function () {
    await expect(
      vault.rent(0, { value: ethers.utils.parseEther("5") })
    ).to.be.revertedWith("DOES_NOT_EXISTS");
  });

  it("Should extend rental period", async function () {
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

    await vault.extend(0, { value: ethers.utils.parseEther("45") });

    const carLease = await vault.carLease(0);
    expect(carLease[1]).to.be.equal(carLease[0].add(180 * 24 * 60 * 60));
  });

  it("Should revert extend rental period in case of not enough duration", async function () {
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

    await expect(
      vault.extend(0, { value: ethers.utils.parseEther("0.000000001") })
    ).to.be.revertedWith("EXTEND_DURATION_TOO_LOW");
  });

  it("Should revert extend rental period in case of not extending in time", async function () {
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

    await ethers.provider.send("evm_increaseTime", [91 * 60 * 60 * 24]);

    await expect(
      vault.extend(0, { value: ethers.utils.parseEther("45") })
    ).to.be.revertedWith("OUT_OF_TIME");
  });

  it("Should revert extend rental period in case of extend from not a renter", async function () {
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
    await expect(
      vault
        .connect(signers[1])
        .extend(0, { value: ethers.utils.parseEther("45") })
    ).to.be.revertedWith("NOT_A_RENTER");
  });

  it("Should return car back", async function () {
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

    // Return 1 day before the expiration period so get some rental back
    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    const carData = await vault.carData(0);
    expect(await ethers.provider.getBalance(carData[6])).to.be.gte(
      "44500000000000000000"
    );
  });

  it("Should revert in case the car is returned back after the period", async function () {
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

    // Return 1 day before the expiration period so get some rental back
    await ethers.provider.send("evm_increaseTime", [91 * 60 * 60 * 24]);
    await expect(vault.headBack(0)).to.be.revertedWith("OUT_OF_TIME");
  });

  it("Should be able for insurance & protocol to claim interest earnings", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.balanceOf(vault.address)).to.be.gt(0);
    expect(await interestToken.balanceOf(signers[9].address)).to.be.gt(0);

    await vault.claimEarnings(
      signers[0].address,
      ethers.utils.parseEther("100")
    );
    expect(await interestToken.balanceOf(vault.address)).to.be.equal(0);

    await vault
      .connect(signers[9])
      .claimEarnings(signers[9].address, ethers.utils.parseEther("100"));
    expect(await interestToken.balanceOf(signers[9].address)).to.be.equal(0);
  });

  it("Should be able for a renter to get his entire collateral back in case insurance operator does nothing", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);
    await ethers.provider.send("evm_increaseTime", [3 * 60 * 60 * 24]);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );

    const balanceBefore = await ethers.provider.getBalance(signers[1].address);
    await vault.claimInsurance(signers[1].address, 0);
    const balanceAfter = await ethers.provider.getBalance(signers[1].address);

    expect(balanceAfter.sub(balanceBefore)).to.be.equal(
      ethers.utils.parseEther("5")
    );
  });

  it("Should be able for a renter to get his entire collateral back in case insurance operator does nothing", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);
    await ethers.provider.send("evm_increaseTime", [3 * 60 * 60 * 24]);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );

    const balanceBefore = await ethers.provider.getBalance(signers[1].address);
    await vault.claimInsurance(signers[1].address, 0);
    const balanceAfter = await ethers.provider.getBalance(signers[1].address);

    expect(balanceAfter.sub(balanceBefore)).to.be.equal(
      ethers.utils.parseEther("5")
    );
  });

  it("Should revert in case the car is not in returned status", async function () {
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

    await expect(
      vault.claimInsurance(signers[1].address, 0)
    ).to.be.revertedWith("STATUS_NOT_RETURNED");
  });

  it("Should revert in case the car is still in review", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);
    await ethers.provider.send("evm_increaseTime", [1 * 60 * 60 * 24]);

    await expect(
      vault.claimInsurance(signers[1].address, 0)
    ).to.be.revertedWith("STILL_IN_REVIEWED");
  });

  it("Should be able to liquidate car position", async function () {
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

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );

    await ethers.provider.send("evm_increaseTime", [91 * 60 * 60 * 24]);
    const balanceBefore = await ethers.provider.getBalance(signers[9].address);
    await vault.liquidate(0);
    const balanceAfter = await ethers.provider.getBalance(signers[9].address);

    expect(balanceAfter.sub(balanceBefore)).to.be.equal(
      ethers.utils.parseEther("4.95")
    );

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(0);
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(0);
  });

  it("Should revert in the case of liquidating before the rental period has been expired", async function () {
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

    await expect(vault.liquidate(0)).to.be.revertedWith("LEASE_NOT_EXPIRED");
  });

  it("Should report car with no damage", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );

    const balanceBefore = await ethers.provider.getBalance(signers[0].address);
    await vault.connect(signers[9]).damageReport(0, 100);
    const balanceAfter = await ethers.provider.getBalance(signers[0].address);

    expect(balanceAfter.sub(balanceBefore)).to.be.equal(
      ethers.utils.parseEther("5")
    );

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(0);
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(0);

    expect(await vault.consumerOf(0)).to.be.equal(ethers.constants.AddressZero);
    expect((await vault.carLease(0))[3]).to.be.equal(0);
  });

  it("Should report car with damage", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(
      ethers.utils.parseEther("4.75")
    );
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(
      ethers.utils.parseEther("0.25")
    );

    const balanceInsuranceBefore = await ethers.provider.getBalance(
      signers[9].address
    );
    const balanceBefore = await ethers.provider.getBalance(signers[0].address);
    await vault.connect(signers[9]).damageReport(0, 50);
    const balanceAfter = await ethers.provider.getBalance(signers[0].address);
    const balanceInsuranceAfter = await ethers.provider.getBalance(
      signers[9].address
    );

    expect(balanceAfter.sub(balanceBefore)).to.be.equal(
      ethers.utils.parseEther("2.5")
    );
    expect(balanceInsuranceAfter).to.be.gt(balanceInsuranceBefore);

    expect(await interestToken.userPrincipal(vault.address)).to.be.equal(0);
    expect(await interestToken.userPrincipal(signers[9].address)).to.be.equal(0);

    expect(await vault.consumerOf(0)).to.be.equal(signers[0].address);
    expect((await vault.carLease(0))[3]).to.be.equal(3);
  });

  it("Should revert in the case not insurance operator tries to report damage", async function () {
    await expect(vault.damageReport(0, 50)).to.be.revertedWith(
      "ONLY_INSURANCE_OPERATOR"
    );
  });

  it("Should revert in the case of reporting damage for not returned car", async function () {
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

    await expect(
      vault.connect(signers[9]).damageReport(0, 50)
    ).to.be.revertedWith("CAR_NOT_RETURNED");
  });

  it("Should be able to repair a car", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    await vault.connect(signers[9]).damageReport(0, 50);
    await vault.connect(signers[9]).repair(0);

    expect(await vault.consumerOf(0)).to.be.equal(ethers.constants.AddressZero);
    expect((await vault.carLease(0))[3]).to.be.equal(0);
  });

  it("Should revert in the case of repairing a car not from the insurance operator", async function () {
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

    await ethers.provider.send("evm_increaseTime", [89 * 60 * 60 * 24]);
    await vault.headBack(0);

    await vault.connect(signers[9]).damageReport(0, 50);
    await expect(vault.repair(0)).to.be.revertedWith("ONLY_INSURANCE_OPERATOR");
  });

  it("Should revert in the case of repairing a not damaged car", async function () {
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
    await expect(vault.connect(signers[9]).repair(0)).to.be.revertedWith(
      "CAR_NOT_DAMAGED"
    );
  });

  it("Should migrate to another earnings provider", async function () {
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

    const StrategyAaveContract = await ethers.getContractFactory(
      "StrategyAave"
    );
    const prevEarningsProvider = StrategyAaveContract.attach(
      strategyAave.address
    );
    strategyAave = await StrategyAaveContract.deploy(
      utils.AavePoolAddress,
      utils.wethGatewayAddress,
      utils.aaveDataProviderAddress,
      utils.AaveIncentivesController
    );
    await strategyAave.deployed();
    await strategyAave.transferOwnership(vault.address);

    const balanceCurrent = await prevEarningsProvider.balanceOf();
    await vault.migrateEarningsProvider(strategyAave.address);

    const interestTokenAddress = await vault.interestToken();
    const InterestToken = await ethers.getContractFactory("InterestToken");
    const interestToken = InterestToken.attach(interestTokenAddress);
    expect(await interestToken.earningsProvider()).to.be.equal(
      strategyAave.address
    );

    expect(await prevEarningsProvider.balanceOf()).to.be.equal(0);
    expect(await strategyAave.balanceOf()).to.be.gte(balanceCurrent);
  });

  it("Should revert in the case not an owner migrate earning provider", async function () {
    await expect(
      vault.connect(signers[1]).migrateEarningsProvider(strategyAave.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should be able to unlist", async function () {
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

    const IVault = new ethers.utils.Interface(VaultAbi);
    const msg = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes4"],
      [0, IVault.getSighash("unlist")]
    );
    const hashMsg = ethers.utils.keccak256(msg);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signMsg1 = await signers[1].signMessage(hashData);
    const signMsg2 = await signers[2].signMessage(hashData);
    const signMsg3 = await signers[3].signMessage(hashData);
    const signatures = [signMsg1, signMsg2, signMsg3];

    await vault.unlist(0, signatures);
    await expect(vault.ownerOf(0)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  it("Should revert in the case the car has been rented or has been returned", async function () {
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

    const IVault = new ethers.utils.Interface(VaultAbi);
    const msg = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes4"],
      [0, IVault.getSighash("unlist")]
    );
    const hashMsg = ethers.utils.keccak256(msg);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signMsg1 = await signers[1].signMessage(hashData);
    const signMsg2 = await signers[2].signMessage(hashData);
    const signMsg3 = await signers[3].signMessage(hashData);
    const signatures = [signMsg1, signMsg2, signMsg3];

    await expect(vault.unlist(0, signatures)).to.be.revertedWith(
      "CAN_NOT_BE_UNLISTED"
    );
  });

  it("Should revert in the case not all car owners have signed their confirmation", async function () {
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

    const IVault = new ethers.utils.Interface(VaultAbi);
    const msg = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "bytes4"],
      [0, IVault.getSighash("unlist")]
    );
    const hashMsg = ethers.utils.keccak256(msg);
    const hashData = ethers.utils.arrayify(hashMsg);
    const signMsg1 = await signers[1].signMessage(hashData);
    const signMsg2 = await signers[2].signMessage(hashData);
    const signatures = [signMsg1, signMsg2];

    await expect(vault.unlist(0, signatures)).to.be.revertedWith(
      "NOT_ALL_OWNERS_AGREE"
    );
  });

  it("Should return tokenURI", async function () {
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

    const tokenURI = await vault.tokenURI(0);
    expect(tokenURI).to.be.equal("test.image.png");
  });

  it("Should revert in case of getting tokenURI for not existing token", async function () {
    await expect(vault.tokenURI(0)).to.be.revertedWith("DOES_NOT_EXISTS");
  });

  it("Should return supported interfaces", async function () {
    await vault.supportsInterface("0xabababab");
  });
});
