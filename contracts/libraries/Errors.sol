// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

library Errors {
    error TH_SAFE_TRANSFER_FAILED();
    error TH_SAFE_TRANSFER_FROM_FAILED();
    error TH_SAFE_APPROVE();
    error TH_SAFE_TRANSFER_NATIVE_FAILED();

    error SA_IN_COOLDOWN_PERIOD();
}
