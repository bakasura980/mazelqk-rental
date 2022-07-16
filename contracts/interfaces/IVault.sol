// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

interface IVault {
    struct CarData {
        bool available;
        uint256 price;
        string tokenURI;
        // running total
        uint256 treasury;
        uint256 collateral;
        uint256 insuranceShare;
        address insuranceOperator;
        address ownershipContract;
    }

    struct LeaseData {
        uint256 start;
        uint256 end;
        uint256 returned;
        CarStatus status;
        uint256 rent;
        uint256 collateral;
    }

    enum CarStatus {
        AVAILABLE,
        RENTED,
        RETURNED,
        DAMAGED
    }

    function carData(uint256 tokenId) external view returns (CarData memory);

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        uint256 price,
        string tokenUri,
        uint256 collateral,
        uint256 insuranceShare,
        address insuranceOperator
    ) external returns (uint256);

    function liquidate(uint256 tokenId) external;

    function setCollateral(uint256 tokenId, uint256 collateral) external;

    function setInsuranceShare(uint256 tokenId, uint256 insuranceShare)
        external;

    function rent(uint256 tokenId) external payable;

    function extend(uint256 tokenId) external payable;

    function headBack(uint256 tokenId) external;

    function claimEarnigns(address to, uint256 amount) external;

    function claimInsurance(address to, uint256 tokenId) external;

    function damageReport(uint256 tokenId, uint256 health) external;

    function repair(uint256 tokenId) external;

    function unlist(uint256 tokenId, bytes[] calldata signatures) external;
}
