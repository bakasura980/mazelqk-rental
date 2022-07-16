/* eslint-disable no-unused-expressions */

import chai from "chai";
import { ethers, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import * as utils from "../../utils";
import { OwnershipToken } from "../../typechain";
import { BigNumber } from "ethers";

const { expect } = chai;

let signers: SignerWithAddress[],
  ownershipToken: OwnershipToken,
  owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, carl: SignerWithAddress, renter: SignerWithAddress;

describe("Ownership Token", function () {
  this.timeout(20000);

  before(async () => {
    await run("compile");
  });

  utils.snapshot(async () => {
    [owner, alice, bob, carl, renter] = await ethers.getSigners();

    ownershipToken = await (await (await ethers.getContractFactory(
      "OwnershipToken"
    )).deploy(
      "123",
      [alice.address, bob.address, carl.address],
      [ethers.utils.parseEther("10"), ethers.utils.parseEther("30"), ethers.utils.parseEther("60")]
    )).deployed();
  });

  it("Calculate the claimable amount correctly", async function () {
    let total = ethers.utils.parseEther("1");
    await ownershipToken.connect(renter).receiveRent({ value: total });

    expect(await ownershipToken.claimable(alice.address)).to.be.equal(
      total.mul(await ownershipToken.balanceOf(alice.address)).div(ethers.utils.parseEther("100"))
    );

    expect(await ownershipToken.claimable(bob.address)).to.be.equal(
      total.mul(await ownershipToken.balanceOf(bob.address)).div(ethers.utils.parseEther("100"))
    );

    expect(await ownershipToken.claimable(carl.address)).to.be.equal(
      total.mul(await ownershipToken.balanceOf(carl.address)).div(ethers.utils.parseEther("100"))
    );
  });

  it("Receive the claimed amount", async function () {
    let total = ethers.utils.parseEther("1");
    await ownershipToken.connect(renter).receiveRent({ value: total });
    let amount = total.mul(await ownershipToken.balanceOf(alice.address)).div(ethers.utils.parseEther("100")).div(2);

    let before = await ethers.provider.getBalance(alice.address);
    let tx = await ownershipToken.connect(alice).claim(alice.address, amount);
    const receipt = await tx.wait();
    let gasCost = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
    let after = await ethers.provider.getBalance(alice.address);

    expect(after.sub(before).add(gasCost)).to.be.equal(
      amount
    );
  });



});
