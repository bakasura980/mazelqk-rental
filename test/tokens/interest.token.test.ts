/* eslint-disable no-unused-expressions */

import chai from "chai";
import { ethers, run } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import * as utils from "../../utils";
import { StrategyAave } from "../../typechain";

const { expect } = chai;

let signers: SignerWithAddress[],
  interestToken: any,
  mockEarningsStrategy: FakeContract<StrategyAave>;

describe("Interest Token", function () {
  this.timeout(20000);

  before(async () => {
    await run("compile");
  });

  utils.snapshot(async () => {
    signers = await ethers.getSigners();

    mockEarningsStrategy = await smock.fake("StrategyAave");

    const InterestTokenContract = await ethers.getContractFactory(
      "InterestToken"
    );
    interestToken = await InterestTokenContract.deploy(
      signers[0].address,
      mockEarningsStrategy.address
    );
    await interestToken.deployed();
  });

  afterEach(async function () {
    mockEarningsStrategy = await smock.fake("StrategyAave", {
      address: mockEarningsStrategy.address,
    });
  });

  describe("Initialization", async function () {
    it("Should initialize correctly", async function () {
      // ETH is with 18 decimals
      expect(await interestToken.decimals()).to.be.equal(18);
      expect(await interestToken.vault()).to.be.equal(signers[0].address);
      expect(await interestToken.earningsStrategy()).to.be.equal(
        mockEarningsStrategy.address
      );
    });
  });

  describe("Mint & Burn", async function () {
    it("Should fail to Mint tokens -> Not the Vault", async function () {
      await expect(
        interestToken.connect(signers[2]).mint(signers[2].address, 100)
      ).to.be.revertedWith("InterestToken: ONLY_VAULT");
    });

    it("Should fail to Burn tokens -> Not the Vault", async function () {
      await expect(
        interestToken.connect(signers[2]).burn(signers[2].address, 100)
      ).to.be.revertedWith("InterestToken: ONLY_VAULT");
    });

    it("Should successfully mint and burn tokens", async function () {
      mockEarningsStrategy.balanceOf.returns(0);

      // user balance before mint -> 0
      const balanceBefore = await interestToken.balanceOf(signers[2].address);
      expect(balanceBefore).to.be.equal(0);

      // user mints 10 debt tokens
      await interestToken.mint(
        signers[2].address,
        ethers.utils.parseEther("10")
      );

      // user balance right after mint -> 10
      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("10"));

      const balanceAfter = await interestToken.balanceOf(signers[2].address);
      expect(balanceAfter).to.be.equal(ethers.utils.parseEther("10"));

      // Earnings Provider accrued interest + principal after a while is 0.1 tokens -> 10 + 0.1
      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("20.1"));

      // user burns 5 interest tokens
      await interestToken.burn(
        signers[2].address,
        ethers.utils.parseEther("5")
      );

      // Burned 5 tokens are withdrawn from the Earnings Provider -> 10.1 - 5 - 0.3 = 4.8 principal + accrued interest
      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("15.1"));

      // user balance after burn with accrued interest
      const balanceBurnAfter = await interestToken.balanceOf(
        signers[2].address
      );
      expect(balanceBurnAfter.toString().slice(0, 6)).to.be.equal("151000");
    });

    it("Should burn the maximum amount possible when trying to burn more than available", async function () {
      const amount = ethers.utils.parseEther("5");
      await interestToken.mint(signers[2].address, amount);

      await interestToken.burn(
        signers[2].address,
        ethers.utils.parseEther("10")
      );

      // user balance after burn with accrued interest
      const balanceBurnAfter = await interestToken.balanceOf(
        signers[2].address
      );
      expect(balanceBurnAfter).to.be.equal("0");
    });
  });

  describe("Transfers", function () {
    it("Should be able to transfer tokens between two accounts", async function () {
      mockEarningsStrategy.balanceOf.returns(0);

      await interestToken.mint(
        signers[2].address,
        ethers.utils.parseEther("7.5")
      );

      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("12.240706")
      );

      await interestToken.mint(
        signers[3].address,
        ethers.utils.parseEther("12.5")
      );

      // Accrue interest
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("30.16859633")
      );

      await interestToken
        .connect(signers[2])
        .transfer(signers[3].address, "14926207769018757284");

      const balance2 = await interestToken.balanceOf(signers[2].address);
      const balance3 = await interestToken.balanceOf(signers[3].address);
      expect(balance2).to.be.equal("0");
      expect(balance3).to.be.equal("30168596330000000000");
    });

    it("Should be able to transfer on behalf of another account", async function () {
      mockEarningsStrategy.balanceOf.returns(0);

      await interestToken.mint(
        signers[2].address,
        ethers.utils.parseEther("7.5")
      );

      await interestToken
        .connect(signers[2])
        .approve(signers[3].address, ethers.utils.parseEther("7.5"));

      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("7.5"));

      await interestToken
        .connect(signers[3])
        .transferFrom(
          signers[2].address,
          signers[3].address,
          ethers.utils.parseEther("7.5")
        );

      const balance = await interestToken.balanceOf(signers[3].address);
      expect(balance).to.be.equal(ethers.utils.parseEther("7.5"));
    });

    it("Should transfer the maximum amount possible when trying to transfer more than available on behalf of another account", async function () {
      const amount = ethers.utils.parseEther("5");
      await interestToken.mint(signers[2].address, amount);
      await interestToken.mint(signers[3].address, amount);

      await interestToken
        .connect(signers[2])
        .transfer(signers[4].address, amount.mul(2));

      expect(await interestToken.balanceOf(signers[4].address)).to.be.equal(
        amount
      );

      await interestToken
        .connect(signers[3])
        .approve(signers[5].address, amount.mul(2));

      await interestToken
        .connect(signers[5])
        .transferFrom(signers[3].address, signers[5].address, amount.mul(2));

      expect(await interestToken.balanceOf(signers[5].address)).to.be.equal(
        amount
      );
    });

    it("Should be reverted in case there is no allowance to transfer on behalf", async function () {
      await expect(
        interestToken
          .connect(signers[2])
          .transferFrom(
            signers[9].address,
            signers[2].address,
            ethers.utils.parseEther("10")
          )
      ).to.be.revertedWith("InterestToken: NOT_ENOUGH_ALLOWANCE");
    });

    it("Should be reverted in case of proceeding a transfer between the same addresses", async function () {
      await expect(
        interestToken
          .connect(signers[3])
          .transfer(signers[3].address, ethers.utils.parseEther("7.5"))
      ).to.be.revertedWith(
        "InterestToken: TRANSFER_BETWEEN_THE_SAME_ADDRESSES"
      );
    });
  });

  describe("Earnings strategy", async function () {
    it("Should set earnings strategy", async function () {
      expect(await interestToken.earningsStrategy()).to.be.equal(
        mockEarningsStrategy.address
      );

      const newStrategy = ethers.Wallet.createRandom().address;
      await interestToken.setEarningsStrategy(newStrategy);

      expect(await interestToken.earningsStrategy()).to.be.equal(newStrategy);
    });

    it("Should fail to set lender strategy", async function () {
      await expect(
        interestToken
          .connect(signers[1])
          .setEarningsStrategy(ethers.Wallet.createRandom().address)
      ).to.be.revertedWith("InterestToken: ONLY_VAULT");
    });
  });

  describe("Interest distribution scenarios", async function () {
    it("Should execute interest distribution simulation 1", async function () {
      const [user1, user2] = [signers[2].address, signers[3].address];

      /**
       * FLOW 1
       *
       * Current Time: T0
       * Interest Rate: 50%
       * Duration: T0 - T12 (12 Months)
       */

      // Vault Index -> 100e18 (default) [Before Mint]
      expect(await interestToken.interestIndex()).to.be.equal(
        ethers.constants.WeiPerEther.mul(100)
      );

      // User1 balance[Before Mint]
      expect(await interestToken.balanceOf(user1)).to.be.equal(0);

      // Total Supply  [Before Mint]
      expect(await interestToken.totalSupply()).to.be.equal(0);

      // Principal + Interest for the entire Vault  [Before Mint]
      mockEarningsStrategy.balanceOf.returns(0);

      // User1 receives 5 tokens from buffer
      await interestToken.mint(user1, ethers.utils.parseEther("5"));

      // User1 Balance  [After Mint]
      expect(await interestToken.balanceOf(user1)).to.be.equal(
        ethers.utils.parseEther("5")
      );

      // Total Supply  [After Mint]
      expect(await interestToken.totalSupply()).to.be.equal(
        ethers.utils.parseEther("5")
      );

      /**
       * FLOW 2
       *
       * Current Time: T12
       * Interest Rate: 50%
       * Duration: T12 - T24 (12 Months)
       */

      // T12 - T24

      // User1 mints 7.5 tokens
      await interestToken.mint(user1, ethers.utils.parseEther("7.5"));

      // Provide the tokens into the Earnings Provider ->
      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("12.5"));

      // User1 Balance  [After Mint]
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("125000");

      /**
       * FLOW 3
       *
       * Current Time: T24
       * Interest Rate: 20%
       * Duration: T24 - T36 (12 Months)
       */

      // T24 - T36
      // Interest 50% -> 12.5 * (1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("20.40117666")
      );

      // User1 Balance
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("204011");

      // User1 Balance  [Before Mint]
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("0");

      // User2 borrows 5 tokens
      await interestToken.mint(user2, ethers.utils.parseEther("5"));

      expect(
        (await interestToken.interestIndex()).toString().slice(0, 6)
      ).to.be.equal("163209");

      // User1 Balance  [After Mint]
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("204011");

      // User2 Balance  [After Mint]
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("500000");

      /**
       * FLOW 4
       *
       * Current Time: T36
       * Interest Rate: 50%
       * Duration: T36 - T48 (12 Months)
       */

      // T24 - T36
      // Interest 50% -> 25.4011 * (1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("41.45698627")
      );

      // User1 Balance
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("332965"); // 33.2965

      // User2 Balance  [After Mint]
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("816044"); // 8.16044
    });

    it("Should execute interest distribution simulation 2", async function () {
      const [user1, user2, user3, user4] = signers
        .slice(2, 6)
        .map((signer) => signer.address);

      /**
       * FLOW 1
       *
       * Current Time: T0
       * Interest Rate: 50%
       * Duration: T0 - T12 (12 Months)
       */

      // Principal + Interest for the entire Vault  [Before Mint]
      mockEarningsStrategy.balanceOf.returns(0);

      // User1 receives 5 tokens from buffer
      await interestToken.mint(user1, ethers.utils.parseEther("5"));

      // User1 Balance  [After Mint]
      expect(await interestToken.balanceOf(user1)).to.be.equal(
        ethers.utils.parseEther("5")
      );

      // Total Supply  [After Mint]
      expect(await interestToken.totalSupply()).to.be.equal(
        ethers.utils.parseEther("5")
      );

      /**
       * FLOW 2
       *
       * Current Time: T12
       * Interest Rate: 50%
       * Duration: T12 - T24 (12 Months)
       */

      // User2 mints 7.5 tokens
      // Interest 50% -> 5 * (1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("8.160470664")
      );
      await interestToken.mint(user2, ethers.utils.parseEther("7.5"));

      // Borrow the tokens from Lending Provider ->
      mockEarningsStrategy.balanceOf.returns(ethers.utils.parseEther("12.5"));

      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("816047");
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("750000");

      // Total supply  [After Mint]
      expect(
        (await interestToken.totalSupply()).toString().slice(0, 6)
      ).to.be.equal("125000");

      /**
       * FLOW 3
       *
       * Current Time: T24
       * Interest Rate: 20%
       * Duration: T24 - T36 (12 Months)
       */

      // T24 - T36
      // Interest accrual with 50% 15.66047*(1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("25.5593612")
      );

      // User1 Balance
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("133186");

      // User2 Balance
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("122407");

      // User3 borrows 4 tokens
      await interestToken.mint(user3, ethers.utils.parseEther("4"));

      // User1 Balance
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("133186");

      // User2 Balance
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("122407");

      // User3 Balance
      expect(
        (await interestToken.balanceOf(user3)).toString().slice(0, 6)
      ).to.be.equal("400000");

      /**
       * FLOW 4
       *
       * Current Time: T36
       * Interest Rate: 50%
       * Duration: T36 - T48 (12 Months)
       */

      // T124 - T36
      // Interest accrual with 50% 29.5593612*(1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("48.24365998")
      );

      // User4 borrows 1 tokens
      await interestToken.mint(user4, ethers.utils.parseEther("1"));

      /**
       * FLOW 5
       *
       * Current Time: T48
       * Interest Rate: 50%
       * Duration: T48 - T60 (12 Months)
       */

      // T48 - T60
      // Interest accrual with 50% 49.24365998*(1+0.5/12)^12
      mockEarningsStrategy.balanceOf.returns(
        ethers.utils.parseEther("80.37028853")
      );

      // User1 Balance
      expect(
        (await interestToken.balanceOf(user1)).toString().slice(0, 6)
      ).to.be.equal("354773");

      // User2 Balance
      expect(
        (await interestToken.balanceOf(user2)).toString().slice(0, 6)
      ).to.be.equal("326059");

      // User3 Balance
      expect(
        (await interestToken.balanceOf(user3)).toString().slice(0, 6)
      ).to.be.equal("106549");

      // User4 Balance
      expect(
        (await interestToken.balanceOf(user4)).toString().slice(0, 6)
      ).to.be.equal("163209");
    });
  });
});
