/* eslint-disable no-unused-expressions */

import chai from "chai";
import { ethers, run } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import * as utils from "../../utils";
import { StrategyAave } from "../../typechain";

const { expect } = chai;

let signers: SignerWithAddress[],
    rdToken: any,
    mockLendingStrategy: FakeContract<StrategyAave>;

describe("Interest Token", function () {
    this.timeout(20000);

    before(async () => {
        await run("compile");
    });

    utils.snapshot(async () => {
        signers = await ethers.getSigners();

        mockLendingStrategy = await smock.fake("StrategyAave");

        const RdTokenContract = await smock.mock("rdToken");
        rdToken = await RdTokenContract.deploy(
            mockVault.address,
            utils.USDCAddress,
            mockLendingStrategy.address,
            ethers.utils.parseEther("5")
        );
        await rdToken.deployed();
    });

    afterEach(async function () {
        mockLendingStrategy = await smock.fake("StrategyAave", {
            address: mockLendingStrategy.address,
        });
    });

    describe("Initialization", async function () {
        it("Should initialize correctly", async function () {
            // ETH is with 18 decimals
            expect(await rdToken.decimals()).to.be.equal(6);
            expect(await rdToken.vault()).to.be.equal(mockVault.address);
            expect(await rdToken.underlying()).to.be.equal(utils.USDCAddress);
            expect(await rdToken.activeLenderStrategy()).to.be.equal(
                mockLendingStrategy.address
            );
        });
    });

    describe("Mint & Burn", async function () {
        it("Should fail to Mint tokens -> Not the Vault", async function () {
            await expect(rdToken.mint(signers[2].address, 100)).to.be.revertedWith(
                "VO_ONLY_VAULT"
            );
        });

        it("Should fail to Burn tokens -> Not the Vault", async function () {
            await expect(rdToken.burn(signers[2].address, 100)).to.be.revertedWith(
                "VO_ONLY_VAULT"
            );
        });

        it("Should successfully mint and burn tokens", async function () {
            mockLendingStrategy.borrowBalanceDetails.returns([0, false]);
            mockVault.getUserEarnings.returns([0, 0]);

            // user balance before mint -> 0
            await rdToken
                .totalBalanceOf(signers[2].address)
                .then((totalUserBalance: any) =>
                    expect(totalUserBalance.toString()).to.be.equal("0")
                );

            // user mints 10 debt tokens
            await rdToken
                .connect(mockVault.wallet)
                .mint(signers[2].address, ethers.utils.parseEther("10"));

            // user balance right after mint -> 10
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("10"),
                false
            ]);
            await rdToken
                .totalBalanceOf(signers[2].address)
                .then((totalUserBalance: any) =>
                    expect(totalUserBalance.toString()).to.be.equal(
                        ethers.utils.parseEther("10")
                    )
                );

            expect(await rdToken.userInterest(signers[2].address)).to.be.equal(0);

            // Lending Provider accrued debt interest + principal after a while is 0.1 tokens -> 10 + 0.1
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("20.1"),
                false
            ]);
            // Harvesting interest is 0.3 after a while
            mockVault.getUserEarnings.returns([ethers.utils.parseEther("0.3"), 0]);

            // user burns 5 debt tokens
            await rdToken
                .connect(mockVault.wallet)
                .burn(signers[2].address, ethers.utils.parseEther("5"));

            expect(await rdToken.userInterest(signers[2].address)).to.be.equal(
                ethers.utils.parseEther("5.1")
            );

            // Burned 5 tokens are repayed to the Lender Provider -> 10.1 - 5 - 0.3 = 4.8 principal + accrued interest
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("15.1"),
                false
            ]);

            // user balance after burn with accrued interest
            await rdToken
                .totalBalanceOf(signers[2].address)
                .then((totalUserBalance: any) =>
                    expect(totalUserBalance.toString().slice(0, 6)).to.be.equal("148000")
                );
        });
    });

    describe("Transfer", async function () {
        it("Should not be able to use standard Transfer -> transfer()", async function () {
            await expect(
                rdToken["transfer(address,uint256)"](signers[0].address, 100)
            ).to.be.revertedWith("IT_TRANSFER_NOT_SUPPORTED");
        });

        it("Should not be able to use standard Transfer -> transferFrom()", async function () {
            await expect(
                rdToken["transferFrom(address,address,uint256)"](
                    signers[0].address,
                    signers[0].address,
                    100
                )
            ).to.be.revertedWith("IT_TRANSFER_NOT_SUPPORTED");
        });
    });

    describe("Lender strategy", async function () {
        it("Should set lender strategy", async function () {
            expect(await rdToken.activeLenderStrategy()).to.be.equal(
                mockLendingStrategy.address
            );

            const newStrategy = ethers.Wallet.createRandom().address;
            await rdToken
                .connect(mockVault.wallet)
                .setActiveLenderStrategy(newStrategy);

            expect(await rdToken.activeLenderStrategy()).to.be.equal(newStrategy);
        });

        it("Should fail to set lender strategy", async function () {
            await expect(
                rdToken.setActiveLenderStrategy(ethers.Wallet.createRandom().address)
            ).to.be.revertedWith("VO_ONLY_VAULT");
        });
    });

    describe("Interest distribution scenarios", async function () {
        it("Should execute interest distribution simulation 2", async function () {
            /*
        
                  Interest earnings simulation can be found in docs folder
        
            */

            const [user1, user2] = [signers[2].address, signers[3].address];
            const buffer = ethers.utils.parseEther("5");

            /**
             * FLOW 1
             *
             * Current Time: T0
             * Interest Rate: 50%
             * Duration: T0 - T12 (12 Months)
             */

            // Vault Index -> 100e18 (default) [Before Mint]
            expect(await rdToken.interestIndex()).to.be.equal(
                ethers.constants.WeiPerEther.mul(100)
            );
            // Vault Balance [Before Mint]

            expect((await rdToken.bufferDetails())[1]).to.be.equal(buffer);

            // User1 balance[Before Mint]
            expect(await rdToken.balanceOf(user1)).to.be.equal(0);

            // Total Supply  [Before Mint]
            expect(await rdToken.totalSupply()).to.be.equal(buffer);

            // Principal + Interest for the entire Vault  [Before Mint]
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // User1 receives 5 tokens from buffer
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user1, ethers.utils.parseEther("5"));

            // Borrow the tokens from Lending Provider
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // Borrow index remains the same on first borrower
            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index -> default  [After Mint]
                expect(interestIndex).to.be.equal(ethers.constants.WeiPerEther.mul(100));
                // User1 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(interestIndex);
            });

            // Vault Balance [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                0
            );

            // User1 Balance  [After Mint]
            expect(await rdToken.balanceOf(user1)).to.be.equal(
                ethers.utils.parseEther("5")
            );
            expect(await rdToken.getTotalInterest(user1)).to.be.equal(0);

            // Total Supply  [After Mint]
            expect(await rdToken.totalSupply()).to.be.equal(
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

            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // User1 mints 7.5 tokens
            await rdToken
                .connect(mockVault.wallet)
                .mint(user1, ethers.utils.parseEther("7.5"));

            // Vault buffer mints 5 tokens
            await rdToken
                .connect(mockVault.wallet)
                .mintBuffer(ethers.utils.parseEther("5"));

            // Borrow the tokens from Lending Provider ->
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("12.5"),
                false,
            ]);

            // Borrow index remains the same on first borrower
            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index -> default  [After Mint]
                expect(interestIndex).to.be.equal(ethers.constants.WeiPerEther.mul(100));
                // User1 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(interestIndex);
            });

            // Vault Balance  [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                ethers.utils.parseEther("5")
            );

            // User1 Balance  [After Mint]
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "125000"
            );
            expect(await rdToken.getTotalInterest(user1)).to.be.equal(0);

            // Total supply  [After Mint]
            expect((await rdToken.totalSupply()).toString().slice(0, 6)).to.be.equal(
                "175000"
            );

            /**
             * FLOW 3
             *
             * Current Time: T24
             * Interest Rate: 20%
             * Duration: T24 - T36 (12 Months)
             */

            // T24 - T36
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("20.40117666"),
                false,
            ]);

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "204011"
            );

            // User1 Balance  [Before Mint]
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "0"
            );

            // User2 borrows 5 tokens
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user2, ethers.utils.parseEther("5"));

            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index [After Mint]
                expect(interestIndex.toString().slice(0, 6)).to.be.equal("163209");
                // User2 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user2)).to.be.equal(interestIndex);
            });

            // Vault Balance  [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                0
            );

            // User1 Balance  [After Mint]
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "204011"
            );
            expect(
                (await rdToken.getTotalInterest(user1)).toString().slice(0, 6)
            ).to.be.equal("790117");

            // User2 Balance  [After Mint]
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "500000"
            );
            expect(
                (await rdToken.getTotalInterest(user2)).toString().slice(0, 6)
            ).to.be.equal("0");

            // Total supply  [After Mint]
            expect((await rdToken.totalSupply()).toString().slice(0, 6)).to.be.equal(
                "175000"
            );
            expect((await rdToken.balanceAtIndex()).toString().slice(0, 6)).to.be.equal(
                "204011"
            );

            /**
             * FLOW 4
             *
             * Current Time: T36
             * Interest Rate: 50%
             * Duration: T36 - T48 (12 Months)
             */

            // T12 - T24
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("33.29664073"),
                false,
            ]);

            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index [After Mint]
                expect(interestIndex.toString().slice(0, 6)).to.be.equal("163209");
                // User1 & User2 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(
                    "100000000000000000000"
                );
                expect(await rdToken.userIndex(user2)).to.be.equal(interestIndex);
            });

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "307582"
            );
            expect(
                (await rdToken.getTotalInterest(user1)).toString().slice(0, 6)
            ).to.be.equal("182582");

            // User2 Balance  [After Mint]
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "753835"
            );
            expect(
                (await rdToken.getTotalInterest(user2)).toString().slice(0, 6)
            ).to.be.equal("253835");
        });

        it("Should execute interest distribution simulation 2", async function () {
            /*
        
                  Interest earnings simulation can be found in docs folder
        
            */

            const [user1, user2, user3, user4] = signers
                .slice(2, 6)
                .map((signer) => signer.address);

            const buffer = ethers.utils.parseEther("5");

            /**
             * FLOW 1
             *
             * Current Time: T0
             * Interest Rate: 50%
             * Duration: T0 - T12 (12 Months)
             */

            // Vault Index -> 100e18 (default) [Before Mint]
            expect(await rdToken.interestIndex()).to.be.equal(
                ethers.constants.WeiPerEther.mul(100)
            );
            // Vault Balance [Before Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(buffer);

            // User1 balance[Before Mint]
            expect(await rdToken.balanceOf(user1)).to.be.equal(0);

            // Total Supply  [Before Mint]
            expect(await rdToken.totalSupply()).to.be.equal(buffer);

            // Principal + Interest for the entire Vault  [Before Mint]
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // User1 receives 5 tokens from buffer
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user1, ethers.utils.parseEther("5"));

            // Borrow the tokens from Lending Provider
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // Borrow index remains the same on first borrower
            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index -> default  [After Mint]
                expect(interestIndex).to.be.equal(ethers.constants.WeiPerEther.mul(100));
                // User1 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(interestIndex);
            });

            // Vault Balance [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                0
            );

            // User1 Balance  [After Mint]
            expect(await rdToken.balanceOf(user1)).to.be.equal(
                ethers.utils.parseEther("5")
            );
            expect(await rdToken.getTotalInterest(user1)).to.be.equal("0");

            // Total Supply  [After Mint]
            expect(await rdToken.totalSupply()).to.be.equal(
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
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // User1 Balance
            expect(await rdToken.balanceOf(user1)).to.be.equal(
                ethers.utils.parseEther("5")
            );

            // User2 mints 7.5 tokens
            await rdToken
                .connect(mockVault.wallet)
                .mint(user2, ethers.utils.parseEther("7.5"));

            // Vault buffer mints 5 tokens
            await rdToken
                .connect(mockVault.wallet)
                .mintBuffer(ethers.utils.parseEther("5"));

            // Borrow the tokens from Lending Provider ->
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("12.5"),
                false,
            ]);

            // Borrow index remains the same on first borrower
            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index -> default  [After Mint]
                expect(interestIndex).to.be.equal(ethers.constants.WeiPerEther.mul(100));
                // User1 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(interestIndex);
            });

            // Vault Balance  [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                ethers.utils.parseEther("5")
            );

            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "500000"
            );
            expect(await rdToken.getTotalInterest(user1)).to.be.equal("0");
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "750000"
            );
            expect(await rdToken.getTotalInterest(user2)).to.be.equal("0");

            // Total supply  [After Mint]
            expect((await rdToken.totalSupply()).toString().slice(0, 6)).to.be.equal(
                "175000"
            );

            /**
             * FLOW 3
             *
             * Current Time: T24
             * Interest Rate: 20%
             * Duration: T24 - T36 (12 Months)
             */

            // T24 - T36
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("20.40117666"),
                false,
            ]);

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "816047"
            );

            // User2 Balance
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "122407"
            );

            // User3 borrows 4 tokens
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user3, ethers.utils.parseEther("4"));

            await rdToken.interestIndex().then(async (interestIndex: any) => {
                // Vault Index [After Mint]
                expect(interestIndex.toString().slice(0, 6)).to.be.equal("163209");
                // User2 Index == Vault Index [After Mint]
                expect(await rdToken.userIndex(user1)).to.be.equal(
                    "100000000000000000000"
                );
                expect(await rdToken.userIndex(user2)).to.be.equal(
                    "100000000000000000000"
                );
                expect(await rdToken.userIndex(user3)).to.be.equal(interestIndex);
            });

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "816047"
            );
            expect(
                (await rdToken.getTotalInterest(user1)).toString().slice(0, 6)
            ).to.be.equal("316047");

            // User2 Balance
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "122407"
            );
            expect(
                (await rdToken.getTotalInterest(user2)).toString().slice(0, 6)
            ).to.be.equal("474070");

            // User3 Balance
            expect((await rdToken.balanceOf(user3)).toString().slice(0, 6)).to.be.equal(
                "400000"
            );
            expect(
                (await rdToken.getTotalInterest(user3)).toString().slice(0, 6)
            ).to.be.equal("0");

            // Vault Balance  [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal(
                ethers.utils.parseEther("1")
            );

            // Total supply  [After Mint]
            expect((await rdToken.totalSupply()).toString().slice(0, 6)).to.be.equal(
                "175000"
            );

            /**
             * FLOW 4
             *
             * Current Time: T36
             * Interest Rate: 50%
             * Duration: T36 - T48 (12 Months)
             */

            // T12 - T24
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("33.29664073"),
                false,
            ]);

            // User4 borrows 1 tokens
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user4, ethers.utils.parseEther("1"));

            // Vault Balance  [After Mint]
            expect((await rdToken.bufferDetails())[1]).to.be.equal("0");

            // Total supply  [After Mint]
            expect((await rdToken.totalSupply()).toString().slice(0, 6)).to.be.equal(
                "175000"
            );

            /**
             * FLOW 5
             *
             * Current Time: T48
             * Interest Rate: 50%
             * Duration: T48 - T60 (12 Months)
             */

            // T48 - T60
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("54.34325197"),
                false,
            ]);

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "193279"
            );
            expect(
                (await rdToken.getTotalInterest(user1)).toString().slice(0, 6)
            ).to.be.equal("143279");

            // User2 Balance
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "289918"
            );
            expect(
                (await rdToken.getTotalInterest(user2)).toString().slice(0, 6)
            ).to.be.equal("214918");

            // User3 Balance
            expect((await rdToken.balanceOf(user3)).toString().slice(0, 6)).to.be.equal(
                "947391"
            );
            expect(
                (await rdToken.getTotalInterest(user3)).toString().slice(0, 6)
            ).to.be.equal("547391");

            // User4 Balance
            expect((await rdToken.balanceOf(user4)).toString().slice(0, 6)).to.be.equal(
                "154956"
            );
            expect(
                (await rdToken.getTotalInterest(user4)).toString().slice(0, 6)
            ).to.be.equal("549568");
        });

        it("Should execute interest distribution simulation 3", async function () {
            /*
        
                  Interest earnings simulation can be found in docs folder
        
            */

            const [user1, user2, user3] = signers
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
            mockLendingStrategy.borrowBalanceDetails.returns([
                0,
                false,
            ]);

            // User1 receives 5 tokens from buffer
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user1, ethers.utils.parseEther("5"));

            /**
             * FLOW 2
             *
             * Current Time: T12
             * Interest Rate: 50%
             * Duration: T12 - T24 (12 Months)
             */

            // T12 - T24
            await rdToken
                .connect(mockVault.wallet)
                .mint(user2, ethers.utils.parseEther("7.5"));

            await rdToken
                .connect(mockVault.wallet)
                .mintBuffer(ethers.utils.parseEther("5"));

            /**
             * FLOW 3
             *
             * Current Time: T24
             * Interest Rate: 20%
             * Duration: T24 - T36 (12 Months)
             */

            // T24 - T36
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("20.40117666"),
                false,
            ]);

            // User3 borrows 4 tokens
            await rdToken
                .connect(mockVault.wallet)
                .transferFromBuffer(user3, ethers.utils.parseEther("4"));

            /**
             * FLOW 4
             *
             * Current Time: T36
             * Interest Rate: 50%
             * Duration: T36 - T37 (1 Month)
             */

            // T36 - T37
            mockLendingStrategy.borrowBalanceDetails.returns([
                ethers.utils.parseEther("21.25122569"),
                false,
            ]);

            // User1 Balance
            expect((await rdToken.balanceOf(user1)).toString().slice(0, 6)).to.be.equal(
                "844475"
            );
            expect(
                (await rdToken.getTotalInterest(user1)).toString().slice(0, 6)
            ).to.be.equal("344475");

            // User2 Balance
            expect((await rdToken.balanceOf(user2)).toString().slice(0, 6)).to.be.equal(
                "126671"
            );
            expect(
                (await rdToken.getTotalInterest(user2)).toString().slice(0, 6)
            ).to.be.equal("516712");

            // User3 Balance
            expect((await rdToken.balanceOf(user3)).toString().slice(0, 6)).to.be.equal(
                "413934"
            );
            expect(
                (await rdToken.getTotalInterest(user3)).toString().slice(0, 6)
            ).to.be.equal("139345");
        });
    });

});
