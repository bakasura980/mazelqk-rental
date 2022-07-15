import { AsyncFunc } from "mocha";
import { network } from "hardhat";
import { HardhatNetworkConfig } from "hardhat/types";

/**
 * Will place the callback in a before hook, then register
 * beforeEach & afterEach to snapshot the hardhat node state and revert to it.
 * Calls to this function must not be nested. Use snapshotNested() if you need to nest snapshots.
 * @param fn the callback
 */
export const snapshot = async function (fn: AsyncFunc) {
    snapshotNested(fn);

    (function () {
        let testSnapshotId: any;

        beforeEach(async () => {
            testSnapshotId = await network.provider.request({
                method: "evm_snapshot",
                params: [],
            });
        });

        afterEach(async () => {
            await network.provider.request({
                method: "evm_revert",
                params: [testSnapshotId],
            });
        });
    })();

    after(async () => {
        // This clears the smock's obervableVM so it stops intercepting the calls to the fake's address
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: (network.config as HardhatNetworkConfig).forking?.url,
                        blockNumber: (network.config as HardhatNetworkConfig).forking
                            ?.blockNumber,
                    },
                },
            ],
        });
    });
};

/**
 * Use this when you are already snapshotting in a parent test suite.
 * @param fn the callback
 */
export const snapshotNested = async function (fn: AsyncFunc) {
    let setupSnapshotId: any;

    before(async () => {
        setupSnapshotId = await network.provider.request({
            method: "evm_snapshot",
            params: [],
        });
    });
    before(fn);
    after(async () => {
        await network.provider.request({
            method: "evm_revert",
            params: [setupSnapshotId],
        });
    });
};
