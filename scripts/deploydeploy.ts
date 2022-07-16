import { ethers } from "hardhat";
import * as utils from "../utils";

async function main() {
    const [owner, alice, bob, carl, insuranceDao1] = await ethers.getSigners();

    const strategyAave = await (await (await ethers.getContractFactory(
        "StrategyAave"
    )).deploy(
        utils.AavePoolAddress,
        utils.wethGatewayAddress,
        utils.aaveDataProviderAddress,
        utils.AaveIncentivesController
    )).deployed();

    const interestToken = await (await (await ethers.getContractFactory(
        "InterestToken"
    )).deploy(
        strategyAave.address
    )).deployed();

    const vault = await (await (await ethers.getContractFactory(
        "Vault"
    )).deploy(
        interestToken.address
    )).deployed();

    console.log("Vault deployed to:", vault.address);

    vault.list([alice.address, bob.address, carl.address], [
        ethers.utils.formatEther("10"),
        ethers.utils.formatEther("30"),
        ethers.utils.formatEther("60")
    ], ethers.utils.formatEther("50"),
        "BARZATA_HONDA.JPG.JSON",
        ethers.utils.formatEther("1"),
        insuranceDao1.address);


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
