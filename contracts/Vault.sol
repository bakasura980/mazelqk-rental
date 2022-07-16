// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./tokens/InterestToken.sol";
import "./tokens/OwnershipToken.sol";
import "./tokens/ERC721Consumable.sol";

import "./interfaces/IVault.sol";

import "./libraries/TransferHelper.sol";

contract Vault is ERC721Enumerable, ERC721Consumable, Ownable, IVault {
    uint256 private _tokenCounter;
    uint256 private _perDayFactor; // Колко процента от цената на ден
    // 0.01
    uint256 internal constant INCENTIVE_FACTOR = 1e16;

    IInterestToken public override interestToken;
    IEarnStrategy public override earningsProvider;

    struct CarData {
        bool available;
        uint256 price;
        string tokenURI;
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
    }

    enum CarStatus {
        AVAILABLE,
        RENTED,
        RETURNED,
        DAMAGED
    }

    mapping(uint256 => CarData) private _carData;
    mapping(uint256 => LeaseData) private _leaseData;

    modifier onlyAvailable(uint256 tokenId) {
        require(consumerOf(tokenId) == address(0), "Vault: ALREADY_RENTED");
        require(
            _leaseData[tokenId].status == CarStatus.AVAILABLE,
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

    modifier inTime(uint256 tokenId) {
        require(msg.sender == consumerOf(tokenId), "Vault: NOT_A_RENTER");
        require(
            _leaseData[tokenId].end >= block.timestamp,
            "Vault: OUT_OF_TIME"
        );
        _;
    }

    modifier onlyInsuranceOperator(uint256 tokenId) {
        require(
            msg.sender == _carData[tokenId].insuranceOperator,
            "Vault: ONLY_INSURANCE_OPERATOR"
        );
        _;
    }

    constructor(address earningsProviderAddress) {
        earningsProvider = IEarnStrategy(earningsProviderAddress);
        interestToken = new InterestToken(earningsProviderAddress);

        _perDayFactor = perDayFactor_;
    }

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        uint256 price,
        string tokenUri,
        uint256 collateral,
        uint256 insuranceShare,
        address insuranceOperator
    )
        external
        collateralInLimits(collateral, price)
        insuranceShareInLimits(insuranceShare)
        returns (uint256)
    {
        uint256 tokenId = _tokenCounter++;

        _mint(address(this), tokenId);
        _carData[tokenId].ownershipContract = new OwnershipToken(
            tokenId,
            owners,
            shares
        );

        _carData[tokenId].price = price;
        _carData[tokenId].tokenURI = tokenUri;
        _carData[tokenId].collateral = collateral;
        _carData[tokenId].insuranceShare = (collateral * insuranceShare) / 1e18;
        _carData[tokenId].insuranceOperator = insuranceOperator;

        // TODO maybe mint it to the ERC20 and approve ourselves to set the renter
        return tokenId;
    }

    function setCollateral(uint256 tokenId, uint256 collateral)
        external
        onlyOwner
        onlyAvailable
        collateralInLimits(collateral, _carData[tokenId].price)
    {
        _carData[tokenId].collateral = collateral;
        emit SetCollateral(tokenId, collateral);
    }

    function setInsuranceShare(uint256 tokenId, uint256 insuranceShare)
        external
        onlyOwner
        onlyAvailable
        insuranceShareInLimits(insuranceShare)
    {
        _carData[tokenId].insuranceShare =
            (_carData[tokenId].collateral * insuranceShare) /
            1e18;

        emit SetInsuranceShare(tokenId, insuranceShare);
    }

    function rent(uint256 tokenId) external payable onlyAvailable {
        _leaseData[tokenId].rent = msg.value - _carData[tokenId].collateral;

        uint256 duration = (_leaseData[tokenId].rent /
            _carData[tokenId].price) *
            _perDayFactor *
            1 days;

        require(duration > 0, "Vault: DURATION_TOO_LOW");

        _leaseData[tokenId].start = block.timestamp;
        _leaseData[tokenId].end = block.timestamp + duration;

        interestToken.mint(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].insuranceShare
        );

        interestToken.mint(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].insuranceShare
        );

        earningsProvider.deposit{value: _carData[tokenId].collateral}();

        _carData[tokenId].ownershipContract.receiveRent{
            value: _leaseData[tokenId].rent
        }();

        changeConsumer(msg.sender, tokenId);
    }

    function extend(uint256 tokenId) external payable inTime {
        uint256 duration = (msg.value / _carData[tokenId].price) *
            _perDayFactor *
            1 days;

        require(duration > 0, "Vault: EXTEND_DURATION_TOO_LOW");
        _leaseData[tokenId].end += duration;
        _leaseData[tokenId].rent += msg.value;
    }

    function headBack(uint256 tokenId) external inTime {
        changeConsumer(address(0), tokenId);
        _leaseData[tokenId].returned = block.timestamp;
        _leaseData[tokenId].status = CarStatus.RETURNED;

        uint256 maxDuration = _leaseData[tokenId].end -
            _leaseData[tokenId].start;
        uint256 actualDuration = _leaseData[tokenId].returned -
            _leaseData[tokenId].start;
        uint256 actualRent = (_leaseData[tokenId].rent * actualDuration) /
            maxDuration;

        TransferHelper.safeTransferNative(
            msg.sender,
            _leaseData[tokenId].rent - actualRent
        );
    }

    function claimEarnigns(address to, uint256 amount) external {
        uint256 accountBalance = interestToken.balanceOf(msg.sender);
        if (amount > accountBalance) {
            amount = accountBalance;
        }
        interestToken.burnInterest(amount);

        earningsProvider.withdraw(to, amount);

        emit ClaimEarnigns(msg.sender, to, amount);
    }

    function claimInsurance(address to, uint256 tokenId) external {
        require(
            _leaseData[tokenId].status == CarStatus.RETURNED,
            "VAULT: STATUS_NOT_RETURNED"
        );
        require(
            _leaseData[tokenId].returned + _leaseData[tokenId].reviewPeriod >
                block.timestamp,
            "VAULT: ALREADY_REVIEWED"
        );

        _leaseData[tokenId].status = CarStatus.DAMAGED;

        interestToken.burnPrincipal(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].insuranceShare
        );

        interestToken.burnPrincipal(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].insuranceShare
        );

        TransferHelper.safeTransferNative(to, _carData[tokenId].collateral);

        emit ClaimInsurance(msg.sender, to, tokenId);
    }

    function liquidate(uint256 tokenId) external {
        require(
            block.timestamp > _leaseData[tokenId].end,
            "Vault: LEASE_NOT_EXPIRED"
        );
        require(
            _leaseData[tokenId].status == CarStatus.RENTED,
            "Vault: NOT_RENTED_TO_BE_LIQUIDATED"
        );

        interestToken.burnPrincipal(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].insuranceShare
        );

        interestToken.burnPrincipal(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].insuranceShare
        );

        uint256 incentive = (_carData[tokenId].collateral * INCENTIVE_FACTOR) /
            1e18;

        earningsProvider.withdraw(msg.sender, incentive);
        earningsProvider.withdraw(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].collateral - incentive
        );
    }

    function damageReport(uint256 tokenId, uint256 health)
        external
        onlyInsuranceOperator(tokenId)
    {
        require(
            _leaseData[tokenId].status = CarStatus.RETURNED,
            "Vault: CAR_NOT_RETURNED"
        );

        interestToken.burnPrincipal(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].insuranceShare
        );

        interestToken.burnPrincipal(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].insuranceShare
        );

        if (health < 100) {
            _leaseData[tokenId].status = CarStatus.DAMAGED;
            uint256 recoverAmount = (_carData[tokenId].collateral * health) /
                100;

            earningsProvider.withdraw(
                _carData[tokenId].insuranceOperator,
                recoverAmount
            );

            earningsProvider.withdraw(
                consumerOf(tokenId),
                _carData[tokenId].collateral - recoverAmount
            );
        } else {
            TransferHelper.safeTransferNative(
                consumerOf(tokenId),
                _carData[tokenId].collateral
            );
            _ready(tokenId);
        }

        emit DamageReport(tokenId, health);
    }

    function repair(uint256 tokenId) external onlyInsuranceOperator(tokenId) {
        require(
            _leaseData[tokenId].status = CarStatus.DAMAGED,
            "Vault: CAR_NOT_DAMAGED"
        );

        ready(tokenId);
        emit Repair(tokenId);
    }

    function _ready(uint256 tokenId) internal {
        changeConsumer(address(0), tokenId);
        delete _leaseData[tokenId];
    }

    function unlist(uint256 tokenId, bytes[] calldata signatures) external {
        require(
            _leaseData[tokenId].status == CarStatus.AVAILABLE ||
                _leaseData[tokenId].status == CarStatus.DAMAGED,
            "Vault: CAN_NOT_BE_UNLISTED"
        );

        // message is tokenId + IVault.unlist.selector
        uint256 total;
        for (uint256 i; i < signatures.length; ) {
            address signer = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(abi.encode(tokenId, Vault.unlist.selector))
                ),
                signatures[i]
            );

            total += _carData[tokenId].ownershipContract.balanceOf(signer);

            unchecked {
                i++;
            }
        }

        require(
            total == _carData[tokenId].ownershipContract.totalSupply(),
            "Vault: NOT_ALL_OWNERS_AGREE"
        );

        _burn(tokenId);
    }

    function migrateEarningsProvider(address newProvider) external onlyOwner {
        uint256 balance = earningsProvider.balanceOf();
        earningsProvider.withdraw(address(this), balance);

        IEarnStrategy(newProvider).deposit{value: balance}();
        interestToken.setEarningsProvider(newProvider);
    }

    // --------------- Getters ---------------
    function carData(uint256 tokenId) public view returns (CarData memory) {
        return _carData[tokenId];
    }

    function ownerOf(uint256 tokenId)
        public
        view
        override(ERC721, IERC721, ERC721Consumable)
        returns (address)
    {
        return ERC721.ownerOf(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "no");
        return carData[tokenId].tokenURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC721Consumable)
        returns (bool)
    {
        return
            ERC721Enumerable.supportsInterface(interfaceId) ||
            ERC721Consumable.supportsInterface(interfaceId);
    }
}
