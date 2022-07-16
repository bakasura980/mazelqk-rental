// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./tokens/OwnershipToken.sol";
import "./interfaces/tokens/IInterestToken.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Vault is ERC721Enumerable, IERC721Consumable {
    uint256 private _tokenCounter;
    uint256 private _collateralFactor;
    uint256 private _perDayFactor;
    // 0.01
    uint256 internal constant INCENTIVE_FACTOR = 1e16;

    struct CarData {
        address ownershipContract;
        bool available;
        uint256 price;
        // running total
        uint256 treasury;
        uint256 collateral;
        uint256 insuranceShare;
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

    mapping(uint256 => CarData) public carData;
    mapping(uint256 => LeaseData) public leaseData;

    modifier onlyAvailable(uint256 tokenId) {
        require(consumerOf(tokenId) == address(0), "Vault: ALREADY_RENTED");
        require(
            leaseData[tokenId].status == CarStatus.AVAILABLE,
            "Vault: UNAVAILABLE_RESOURCE"
        );
        _;
    }

    modifier collateralInLimits(uint256 collateral, uint256 price) {
        require(collateral <= price, "Vault: COLLATERAL_MORE_THAN_PRICE");
        _;
    }

    modifier insuranceShareInLimits(uint256 insuranceShare) {
        require(insuranceShare <= 1e18, "Vault: SHARE_TOO_BIG");
        _;
    }

    modifier inTime(uint256 tokensId) {
        require(msg.sender == consumerOf(tokenId), "Vault: NOT_A_RENTER");
        require(
            leaseData[tokenId].end >= block.timestamp,
            "Vault: OUT_OF_TIME"
        );
        _;
    }

    constructor(uint256 collateralFactor_, uint256 perDayFactor_) {
        _collateralFactor = collateralFactor_;
        _perDayFactor = perDayFactor_;
    }

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        string tokenURI,
        uint256 price,
        uint256 collateral,
        uint256 insuranceShare
    )
        external
        collateralInLimits(collateral, price)
        insuranceShareInLimits(insuranceShare)
        returns (uint256)
    {
        uint256 tokenId = _mint(address(this), _tokenCounter++);

        carData[tokenId].ownershipContract = new OwnershipToken(
            address(this),
            tokenId,
            owners[i],
            shares[i]
        );

        carData[tokenId].price = price;
        carData[tokenId].collateral = collateral;
        carData[tokenId].insuranceShare = (collateral * insuranceShare) / 1e18;

        // TODO maybe mint it to the ERC20 and approve ourselves to set the renter
        return tokenId;
    }

    function liquidate(uint256 tokenId) external {
        require(block.timestamp > leaseData[tokenId].end, "not expired");
        uint256 incentive = (leaseData[tokenId].collateral * INCENTIVE_FACTOR) /
            1e18;
        _sendEth(msg.sender, incentive);
        leaseData[tokenId].collateral -= incentive;
        _setHealth(tokenId, 0);
    }

    function setCollateral(uint256 tokenId, uint256 collateral)
        external
        onlyOwner
        onlyAvailable
        collateralInLimits(collateral, carData[tokenId].price)
    {
        carData[tokenId].collateral = collateral;
        emit SetCollateral(tokenId, collateral);
    }

    function setInsuranceShare(uint256 tokenId, uint256 insuranceShare)
        external
        onlyOwner
        onlyAvailable
        insuranceShareInLimits(insuranceShare)
    {
        carData[tokenId].insuranceShare =
            (carData[tokenId].collateral * insuranceShare) /
            1e18;

        emit SetInsuranceShare(tokenId, insuranceShare);
    }

    function rent(uint256 tokenId) external payable onlyAvailable {
        leaseData[tokenId].rent = msg.value - carData[tokenId].collateral;

        uint256 duration = (leaseData[tokenId].rent / carData[tokenId].price) *
            _perDayFactor *
            day;

        require(duration > 0, "Vault: DURATION_TOO_LOW");

        leaseData[tokenId].start = block.timestamp;
        leaseData[tokenId].end = block.timestamp + duration;

        IInterestToken(interestToken).mint(
            carData[tokenId].operator,
            carData[tokenId].interestShare
        );

        IInterestToken(interestToken).mint(
            address(this),
            carData[tokenId].collateral - carData[tokenId].interestShare
        );

        IEarnStrategy(earningsProvider).deposit{value: amount}();

        carData[tokenId].ownershipContract.receiveRent{
            value: leaseData[tokenId].rent
        }();

        changeConsumer(msg.sender, tokenId);
    }

    function extend(uint256 tokenId) external payable inTime {
        uint256 duration = (msg.value / carData[tokenId].price) *
            _perDayFactor *
            day;

        require(duration > 0, "Vault: EXTEND_DURATION_TOO_LOW");
        leaseData[tokenId].end += duration;
        leaseData[tokenId].rent += msg.value;
    }

    function headBack(uint256 tokenId) external inTime {
        changeConsumer(address(0), tokenId);
        leaseData[tokenId].returned = block.timestamp;
        leaseData[tokenId].status = CarStatus.RETURNED;

        uint256 maxDuration = leaseData[tokenId].end - leaseData[tokenId].start;
        uint256 actualDuration = block.timestamp - leaseData[tokenId].start;
        uint256 actualRent = (leaseData[tokenId].rent * actualDuration) /
            maxDuration;

        TransferHelper.safeTransferNative(
            msg.sender,
            leaseData[tokenId].rent - actualRent
        );
    }

    function claimEarnigns(address to, uint256 amount) external {
        uint256 accountBalance = interestToken.balanceOf(msg.sender);
        if (amount > accountBalance) {
            amount = accountBalance;
        }
        IInterestToken(interestToken).burnInterest(amount);

        IEarnStrategy(earningsStrategy).withdraw(to, amount);

        emit ClaimEarnigns(msg.sender, to, amount);
    }

    function claimInsurance(address to, uint256 tokenId) external {
        require(
            leaseData[tokenId].status == CarStatus.RETURNED,
            "VAULT: STATUS_NOT_RETURNED"
        );
        require(
            leaseData[tokenId].returned + leaseData[tokenId].reviewPeriod >
                block.timestamp,
            "VAULT: ALREADY_REVIEW"
        );

        leaseData[tokenId].status = CarStatus.DAMAGED;

        IInterestToken(interestToken).burnPrincipal(
            carData[tokenId].operator,
            carData[tokenId].interestShare
        );

        IInterestToken(interestToken).burnPrincipal(
            address(this),
            carData[tokenId].collateral - carData[tokenId].interestShare
        );

        TransferHelper.safeTransferNative(to, carData[tokenId].collateral);

        emit ClaimInsurance(msg.sender, to, tokenId);
    }

    // function claimRent(address to, uint256 amount) external {
    //     // it'll just be 0, let them waste gas
    //     // uint256 shares = carData[tokenId].ownershipContract.balanceOf(
    //     //     msg.sender
    //     // );
    //     // require(shares > 0, "not an owner");

    //     // uint256 amount = carData[tokenId].ownershipContract.claim(msg.sender);
    //     // carData[tokenId].treasury,
    //     // );

    //     if (amount > 0) {
    //         (bool success, bytes memory returndata) = msg.sender.call{
    //             value: amount
    //         }("");
    //         require(success, string(returndata));
    //     }
    // }

    function damageReport(uint256 tokenId, uint256 health) external onlyDao {
        _setHealth(tokenId, health);
    }

    function _setHealth(uint256 tokenId, uint256 health) internal {
        if (health < 100) {
            leaseData[tokenId].status = CarStatus.DAMAGED;
            uint256 collect = leaseData[tokenId].collateral *
                (1 - health / 100);

            _sendEth(
                consumerOf(tokenId),
                leaseData[tokenId].collateral - collect
            );

            carData[tokenId].treasury += collect;
        } else {
            _ready(tokenId);
        }
    }

    function repair(uint256 tokenId) external onlyDao {
        _ready(tokenId);
    }

    function _ready(uint256 tokenId) internal {
        changeConsumer(address(0), tokenId);

        delete leaseData[tokenId];
    }

    function unlist(uint256 tokenId, bytes[] calldata signatures) external {
        require(
            carData[tokenId].status == CarStatus.AVAILABLE ||
                carData[tokenId].status == CarStatus.DAMAGED,
            "SHITS IN USE"
        );

        // message is tokenId + IVault.unlist.selector

        uint256 total;
        for (uint256 i; i < signatures.length; ) {
            // TODO recover address
            address signer;

            total += carData[tokenId].ownershipContract.balanceOf(signer);
            uint256 amount = carData[tokenId].ownershipContract.claim(signer);

            _sendEth(signer, amount);

            unchecked {
                i++;
            }
        }

        require(
            total == carData[tokenId].ownershipContract.totalSupply(),
            "EVERYONE!!!.gif"
        );

        _burn(tokenId);
    }
}
