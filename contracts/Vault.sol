// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./tokens/InterestToken.sol";
import "./tokens/OwnershipToken.sol";
import "./tokens/ERC721Consumable.sol";

import "./interfaces/IVault.sol";
import "./interfaces/tokens/IInterestToken.sol";
import "./interfaces/strategies/earn-strategies/IEarnStrategy.sol";

import "./libraries/Errors.sol";
import "./libraries/TransferHelper.sol";

contract Vault is ERC721Enumerable, ERC721Consumable, Ownable, IVault {
    uint256 private _tokenCounter;
    uint256 private _perDayFactor;
    uint256 internal constant INCENTIVE_FACTOR = 1e16;

    IInterestToken public override interestToken;
    IEarnStrategy public override earningsProvider;

    mapping(uint256 => CarData) private _carData;
    mapping(uint256 => LeaseData) private _leaseData;

    modifier inTime(uint256 tokenId) {
        _inTime(tokenId);
        _;
    }

    function _inTime(uint256 tokenId) internal view {
        if (msg.sender != consumerOf(tokenId)) {
            revert Errors.NOT_A_RENTER();
        }

        if (_leaseData[tokenId].end < block.timestamp) {
            revert Errors.OUT_OF_TIME();
        }
    }

    modifier onlyInsuranceOperator(uint256 tokenId) {
        _onlyInsuranceOperator(tokenId);
        _;
    }

    function _onlyInsuranceOperator(uint256 tokenId) internal view {
        if (msg.sender != _carData[tokenId].insuranceOperator) {
            revert Errors.ONLY_INSURANCE_OPERATOR();
        }
    }

    constructor(address earningsProviderAddress, uint256 perDayFactor_)
        ERC721("MAZELQK_RENTAL", "MZQK")
    {
        earningsProvider = IEarnStrategy(earningsProviderAddress);
        interestToken = new InterestToken(earningsProviderAddress);

        _perDayFactor = perDayFactor_;
    }

    /// @notice List a new car on the rental market and create an NFT for it
    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        uint256 price,
        string calldata tokenUri,
        uint256 collateral,
        uint256 insuranceShare,
        uint256 reviewPeriod,
        address insuranceOperator
    ) external override returns (uint256) {
        if (collateral > price) {
            revert Errors.COLLATERAL_MORE_THAN_PRICE();
        }
        if (insuranceShare > 1e18) {
            revert Errors.SHARE_TOO_BIG();
        }
        uint256 tokenId = _tokenCounter++;

        _mint(address(this), tokenId);
        _carData[tokenId] = CarData(
            price,
            tokenUri,
            collateral,
            (collateral * insuranceShare) / 1e18,
            reviewPeriod,
            insuranceOperator,
            new OwnershipToken(tokenId, owners, shares)
        );

        emit List(
            tokenId,
            price,
            tokenUri,
            collateral,
            insuranceShare,
            reviewPeriod,
            insuranceOperator,
            address(_carData[tokenId].ownershipContract)
        );
        return tokenId;
    }

    /// @notice Rent a car by providing insurance collateral and rental amount
    /// @notice The duration of the service is calculated automatically based on the provided rental amount
    /// @param tokenId The id of the NFT you want to rent
    function rent(uint256 tokenId) external payable override {
        if (!_exists(tokenId)) {
            revert Errors.DOES_NOT_EXISTS();
        }
        if (consumerOf(tokenId) != address(0)) {
            revert Errors.ALREADY_RENTED();
        }
        if (_leaseData[tokenId].status != CarStatus.AVAILABLE) {
            revert Errors.UNAVAILABLE_RESOURCE();
        }

        uint256 rentAmount = msg.value - _carData[tokenId].collateral;
        _leaseData[tokenId].rent = rentAmount;
        _leaseData[tokenId].status = CarStatus.RENTED;

        uint256 duration = (rentAmount * 1 days * 1e18) /
            (_carData[tokenId].price * _perDayFactor);

        if (duration == 0) {
            revert Errors.DURATION_TOO_LOW();
        }

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

        changeConsumer(msg.sender, tokenId);

        emit Rent(tokenId, msg.sender, duration);
    }

    /// @notice Extend the rental period of a car you have already lended
    /// @param tokenId The id of the NFT you want to extend the period for
    function extend(uint256 tokenId) external payable override inTime(tokenId) {
        uint256 duration = (msg.value * 1 days * 1e18) /
            (_carData[tokenId].price * _perDayFactor);

        if (duration == 0) {
            revert Errors.EXTEND_DURATION_TOO_LOW();
        }
        _leaseData[tokenId].end += duration;
        _leaseData[tokenId].rent += msg.value;

        emit Extend(tokenId, duration);
    }

    /// @notice Return a car and get your insurance collateral back
    /// @param tokenId The id of the NFT you are returning back
    function headBack(uint256 tokenId) external override inTime(tokenId) {
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

        _carData[tokenId].ownershipContract.receiveRent{value: actualRent}();

        emit Return(
            tokenId,
            _leaseData[tokenId].start,
            _leaseData[tokenId].returned,
            _leaseData[tokenId].end
        );
    }

    /// @notice Insurance operators or protocol owner can withdraw their earnings from the earnings provider
    /// @param to The recipient of the earnings amount
    /// @param amount The amount of earnings
    function claimEarnings(address to, uint256 amount) external override {
        address claimer = msg.sender;
        if (msg.sender == owner()) {
            claimer = address(this);
        }

        uint256 amountBurned = interestToken.burnInterest(claimer, amount);
        earningsProvider.withdraw(to, amountBurned);

        emit ClaimEarnings(claimer, to, amount);
    }

    /// @notice A renter is able to withdraw his insurance in case the insurance operator does not
    /// @notice perform a review on time
    /// @param to The recipient of the insurance amount
    /// @param tokenId The id of the NFT
    function claimInsurance(address to, uint256 tokenId) external override {
        if (_leaseData[tokenId].status != CarStatus.RETURNED) {
            revert Errors.STATUS_NOT_RETURNED();
        }
        if (
            _leaseData[tokenId].returned + _carData[tokenId].reviewPeriod >=
            block.timestamp
        ) {
            revert Errors.STILL_IN_REVIEWED();
        }

        _leaseData[tokenId].status = CarStatus.DAMAGED;

        interestToken.burnPrincipal(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].insuranceShare
        );

        interestToken.burnPrincipal(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].insuranceShare
        );

        earningsProvider.withdraw(to, _carData[tokenId].collateral);

        interestToken.snapshot();

        emit ClaimInsurance(msg.sender, to, tokenId);
    }

    /// @notice Liquidate a car position in case a renter has not returned it on time(Steel)
    /// @param tokenId The id of the NFT to liquidate
    function liquidate(uint256 tokenId) external override {
        if (block.timestamp <= _leaseData[tokenId].end) {
            revert Errors.LEASE_NOT_EXPIRED();
        }
        if (_leaseData[tokenId].status != CarStatus.RENTED) {
            revert Errors.NOT_RENTED_TO_BE_LIQUIDATED();
        }

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

        interestToken.snapshot();

        emit Liquidate(tokenId);
    }

    /// @notice Evaluate car damage after being returned from a renter
    /// @param tokenId The id of the NFT to evaluate
    /// @param health The state of the car in the time of return(how healthy it is)
    function damageReport(uint256 tokenId, uint256 health)
        external
        override
        onlyInsuranceOperator(tokenId)
    {
        if (_leaseData[tokenId].status != CarStatus.RETURNED) {
            revert Errors.CAR_NOT_RETURNED();
        }

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
            uint256 renterAmount = (_carData[tokenId].collateral * health) /
                100;

            earningsProvider.withdraw(
                _carData[tokenId].insuranceOperator,
                _carData[tokenId].collateral - renterAmount
            );

            earningsProvider.withdraw(consumerOf(tokenId), renterAmount);
        } else {
            earningsProvider.withdraw(
                consumerOf(tokenId),
                _carData[tokenId].collateral
            );
            _ready(tokenId);
        }

        interestToken.snapshot();

        emit DamageReport(tokenId, health);
    }

    /// @notice Repair car damage after being returned from a renter
    /// @param tokenId The id of the NFT to "repair"
    function repair(uint256 tokenId)
        external
        override
        onlyInsuranceOperator(tokenId)
    {
        if (_leaseData[tokenId].status != CarStatus.DAMAGED) {
            revert Errors.CAR_NOT_DAMAGED();
        }

        _ready(tokenId);
        emit Repair(tokenId);
    }

    /// @notice Make the car available for renting again
    /// @param tokenId The id of the NFT to make available again
    function _ready(uint256 tokenId) internal {
        changeConsumer(address(0), tokenId);
        delete _leaseData[tokenId];
    }

    /// @notice Remove a car from being lended by performing a validation if all the owners have signer their approval
    /// @param tokenId The id of the NFT to remove
    /// @param signatures The approvals of the owners
    function unlist(uint256 tokenId, bytes[] calldata signatures)
        external
        override
    {
        if (
            _leaseData[tokenId].status != CarStatus.AVAILABLE &&
            _leaseData[tokenId].status != CarStatus.DAMAGED
        ) {
            revert Errors.CAN_NOT_BE_UNLISTED();
        }

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

        if (total != _carData[tokenId].ownershipContract.totalSupply()) {
            revert Errors.NOT_ALL_OWNERS_AGREE();
        }

        _burn(tokenId);

        emit UnList(tokenId);
    }

    /// @notice Migrate from one earnings provider to another
    /// @param newProvider The address of the new earnings provider
    function migrateEarningsProvider(address newProvider) external onlyOwner {
        uint256 balance = earningsProvider.balanceOf();
        earningsProvider.withdraw(address(this), balance);

        IEarnStrategy(newProvider).deposit{value: balance}();
        interestToken.setEarningsProvider(newProvider);
    }

    receive() external payable {}

    // --------------- Getters ---------------
    /// @notice Return car data details
    /// @param tokenId The id of the NFT to search for
    function carData(uint256 tokenId)
        external
        view
        override
        returns (CarData memory)
    {
        return _carData[tokenId];
    }

    /// @notice Return car leasing details
    /// @param tokenId The id of the NFT to search for
    function carLease(uint256 tokenId)
        external
        view
        override
        returns (LeaseData memory)
    {
        return _leaseData[tokenId];
    }

    /// @notice Owner of an NFT
    /// @param tokenId The id of the NFT to search for
    function ownerOf(uint256 tokenId)
        public
        view
        override(ERC721, IERC721, ERC721Consumable)
        returns (address)
    {
        return ERC721.ownerOf(tokenId);
    }

    /// @notice NFT image URI
    /// @param tokenId The id of the NFT to search for
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) {
            revert Errors.DOES_NOT_EXISTS();
        }
        return _carData[tokenId].tokenURI;
    }

    /// @notice supportsInterface
    /// @param interfaceId The interface to check if supported
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
