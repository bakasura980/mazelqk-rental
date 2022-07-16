// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Errors {
    error ALREADY_RENTED();
    error UNAVAILABLE_RESOURCE();
    error NOT_A_RENTER();
    error OUT_OF_TIME();
    error ONLY_INSURANCE_OPERATOR();
    error COLLATERAL_MORE_THAN_PRICE();
    error SHARE_TOO_BIG();
    error DURATION_TOO_LOW();
    error EXTEND_DURATION_TOO_LOW();
    error STATUS_NOT_RETURNED();
    error ALREADY_REVIEWED();
    error LEASE_NOT_EXPIRED();
    error NOT_RENTED_TO_BE_LIQUIDATED();
    error CAR_NOT_RETURNED();
    error CAR_NOT_DAMAGED();
    error CAN_NOT_BE_UNLISTED();
    error NOT_ALL_OWNERS_AGREE();
    error DOES_NOT_EXISTS();
}
