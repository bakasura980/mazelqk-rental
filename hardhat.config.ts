import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "solidity-coverage";
import "hardhat-contract-sizer";
import chalk from "chalk";
import { ethers } from "ethers";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts = [];
for (let index = 0; index < 10; index++) {
  accounts.push({
    privateKey: ethers.Wallet.createRandom().privateKey,
    balance: "371231719819352917048725983856890896639803364957755791114240",
  });
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // required for smocks plugin
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: "" + process.env.MAINNET_KEY,
        blockNumber: 14403569,
      },
      accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "",
  },
};

/**
 * At the end of testing, this will print out cumulative running times per test suite ("describe").
 */
if (process.env.REPORT_MOCHA_TIME === "true") {
  config.mocha = {
    rootHooks: {
      beforeEach: function (done) {
        const _this: any = this;
        if (!_this.currentTest.parent.timerStart) {
          _this.currentTest.parent.timerIndex = 0;
          _this.currentTest.parent.timerStart = Date.now();
        }
        done();
      },
      afterEach: function (done) {
        const _this: any = this;
        if (
          _this.currentTest.parent.timerStart &&
          ++_this.currentTest.parent.timerIndex ===
            _this.currentTest.parent.tests.length
        ) {
          _this.currentTest.parent.timerDuration =
            Date.now() - _this.currentTest.parent.timerStart;
          // console.log(`Suite "${_this.currentTest.parent.fullTitle()}" Elapsed: ${_this.currentTest.parent.timerDuration}ms`);
        }
        done();
      },
      afterAll: function (done) {
        const _this: any = this;
        const results: Array<any> = [];
        function walk_suites(suite: any) {
          if (suite.suites.length == 0) {
            if (suite.timerDuration !== undefined) {
              results.push({
                title: suite.fullTitle(),
                time: suite.timerDuration,
              });
            }
          } else {
            for (const x of suite.suites) {
              walk_suites(x);
            }
          }
        }

        walk_suites(_this.test.parent);
        console.log(
          "Suite cumulative times from beforeEach to afterEach (excludes before and after):"
        );
        const averageTime: number =
          results.reduce((p, c) => p + c.time, 0) / results.length;
        let labelTime: String;
        for (const result of results) {
          if (result.time > averageTime) {
            labelTime = chalk.red(`${result.time}ms`);
          } else {
            labelTime = `${result.time}ms`;
          }
          console.log(`${result.title} ${labelTime}`);
        }

        done();
      },
    },
  };
}

export default config;
