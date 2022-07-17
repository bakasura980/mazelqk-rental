// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./tokens/IInterestToken.sol";
import "./tokens/IOwnershipToken.sol";
import "./strategies/earn-strategies/IEarnStrategy.sol";

interface IVault {
    event List(
        uint256 tokenId,
        uint256 price,
        string tokenUri,
        uint256 collateral,
        uint256 insuranceShare,
        uint256 reviewPeriod,
        address insuranceOperator,
        address ownershipContract
    );
    event Rent(uint256 tokenId, address renter, uint256 duration);
    event Extend(uint256 tokenId, uint256 duration);
    event Return(
        uint256 tokenId,
        uint256 leaseStart,
        uint256 leaseReturn,
        uint256 leaseEnd
    );
    event ClaimEarnings(address claimer, address recipient, uint256 amount);
    event ClaimInsurance(address renter, address recipient, uint256 tokenId);
    event Liquidate(uint256 tokenId);
    event DamageReport(uint256 tokenId, uint256 health);
    event Repair(uint256 tokenId);
    event UnList(uint256 tokenId);

    struct CarData {
        uint256 price;
        string tokenURI;
        uint256 collateral;
        uint256 insuranceShare;
        uint256 reviewPeriod;
        address insuranceOperator;
        IOwnershipToken ownershipContract;
    }

    struct LeaseData {
        uint256 start;
        uint256 end;
        uint256 returned;
        CarStatus status;
        uint256 rent;
    }

    enum CarStatus {
        AVAILABLE,
        RENTED,
        RETURNED,
        DAMAGED
    }

    function interestToken() external view returns (IInterestToken);

    function earningsProvider() external view returns (IEarnStrategy);

    function carData(uint256 tokenId) external view returns (CarData memory);

    function carLease(uint256 tokenId) external view returns (LeaseData memory);

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        uint256 price,
        string calldata tokenUri,
        uint256 collateral,
        uint256 insuranceShare,
        uint256 reviewPeriod,
        address insuranceOperator
    ) external returns (uint256);

    function rent(uint256 tokenId) external payable;

    function extend(uint256 tokenId) external payable;

    function headBack(uint256 tokenId) external;

    function claimEarnings(address to, uint256 amount) external;

    function claimInsurance(address to, uint256 tokenId) external;

    function liquidate(uint256 tokenId) external;

    function damageReport(uint256 tokenId, uint256 health) external;

    function repair(uint256 tokenId) external;

    function unlist(uint256 tokenId, bytes[] calldata signatures) external;
}
