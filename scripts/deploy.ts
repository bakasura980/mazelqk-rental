// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as utils from "../utils";

async function main() {
  const [owner, alice, bob, carl, insuranceDao] = await ethers.getSigners();

  const strategyAave = await (
    await (
      await ethers.getContractFactory("StrategyAave")
    ).deploy(
      utils.AavePoolAddress,
      utils.wethGatewayAddress,
      utils.aaveDataProviderAddress,
      utils.AaveIncentivesController
    )
  ).deployed();

  const vault = await (
    await (
      await ethers.getContractFactory("Vault")
    ).deploy(strategyAave.address, ethers.utils.parseEther("0.01"))
  ).deployed();
  // const vault = await (
  //   await ethers.getContractFactory("Vault")
  // ).attach("0x2Bb919fd37169d34cbaD2C8d0fE23a32a5067028");

  console.log("current block", await ethers.provider.getBlockNumber());
  console.log("Vault deployed to:", vault.address);

  const tx = await vault.list(
    [alice.address, bob.address, carl.address],
    [
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("30"),
      ethers.utils.parseEther("60"),
    ],
    ethers.utils.parseEther("50"),
    "BARZATA_HONDA.JPG.JSON",
    ethers.utils.parseEther("5"),
    ethers.utils.parseEther("0.5"),
    2 * 60 * 60 * 24, // 2 day for reviewing
    insuranceDao.address
  );

  await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
