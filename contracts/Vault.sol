// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "./tokens/InterestToken.sol";
import "./tokens/OwnershipToken.sol";
import "./tokens/ERC721Consumable.sol";

import "./libraries/TransferHelper.sol";

// Todo: Deploy interest token

contract Vault is ERC721Enumerable, ERC721Consumable, Ownable {
    uint256 private _tokenCounter;
    uint256 private _collateralFactor;
    uint256 private _perDayFactor;
    // 0.01
    uint256 internal constant INCENTIVE_FACTOR = 1e16;

    address public override interestToken;
    address public override earningsProvider;

    struct CarData {
        address ownershipContract;
        bool available;
        uint256 price;
        // running total
        uint256 treasury;
        uint256 collateral;
        uint256 insuranceShare;
        address insuranceOperator;
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

    mapping(uint256 => CarData) private _carData;
    mapping(uint256 => LeaseData) private _leaseData;

    mapping(uint256 => string) private _tokenURIs;

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

    constructor(address interestTokenAddress, address earningsProviderAddress) {
        interestToken = interestTokenAddress;
        earningsProvider = earningsProviderAddress;
        _collateralFactor = collateralFactor_;
        _perDayFactor = perDayFactor_;
    }

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

    function tokenURI(uint256 tokenId_)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId_), "no");
        return _tokenURIs[tokenId_];
    }

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        string tokenUri,
        uint256 price,
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
            this,
            tokenId,
            owners,
            shares
        );

        _tokenURIs[tokenId] = tokenUri;

        _carData[tokenId].price = price;
        _carData[tokenId].collateral = collateral;
        _carData[tokenId].insuranceShare = (collateral * insuranceShare) / 1e18;
        _carData[tokenId].insuranceOperator = insuranceOperator;

        // TODO maybe mint it to the ERC20 and approve ourselves to set the renter
        return tokenId;
    }

    function liquidate(uint256 tokenId) external {
        require(block.timestamp > _leaseData[tokenId].end, "not expired");
        uint256 incentive = (_leaseData[tokenId].collateral *
            INCENTIVE_FACTOR) / 1e18;

        TransferHelper.safeTransferNative(msg.sender, incentive);

        _leaseData[tokenId].collateral -= incentive;
        _setHealth(tokenId, 0);
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

        IInterestToken(interestToken).mint(
            _carData[tokenId].insuranceOperator,
            _carData[tokenId].interestShare
        );

        IInterestToken(interestToken).mint(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].interestShare
        );

        IEarnStrategy(earningsProvider).deposit{
            value: _carData[tokenId].collateral
        }();

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
        uint256 actualDuration = block.timestamp - _leaseData[tokenId].start;
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
        IInterestToken(interestToken).burnInterest(amount);

        IEarnStrategy(earningsProvider).withdraw(to, amount);

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

        IInterestToken(interestToken).burnPrincipal(
            _carData[tokenId].operator,
            _carData[tokenId].interestShare
        );

        IInterestToken(interestToken).burnPrincipal(
            address(this),
            _carData[tokenId].collateral - _carData[tokenId].interestShare
        );

        TransferHelper.safeTransferNative(to, _carData[tokenId].collateral);

        emit ClaimInsurance(msg.sender, to, tokenId);
    }

    // function claimRent(address to, uint256 amount) external {
    //     // it'll just be 0, let them waste gas
    //     // uint256 shares = _carData[tokenId].ownershipContract.balanceOf(
    //     //     msg.sender
    //     // );
    //     // require(shares > 0, "not an owner");

    //     // uint256 amount = _carData[tokenId].ownershipContract.claim(msg.sender);
    //     // _carData[tokenId].treasury,
    //     // );

    //     if (amount > 0) {
    //         (bool success, bytes memory returndata) = msg.sender.call{
    //             value: amount
    //         }("");
    //         require(success, string(returndata));
    //     }
    // }

    function damageReport(uint256 tokenId, uint256 health)
        external
        onlyInsuranceOperator(tokenId)
    {
        _setHealth(tokenId, health);
    }

    function _setHealth(uint256 tokenId, uint256 health) internal {
        if (health < 100) {
            _leaseData[tokenId].status = CarStatus.DAMAGED;
            uint256 collect = _leaseData[tokenId].collateral *
                (1 - health / 100);

            TransferHelper.safeTransferNative(
                consumerOf(tokenId),
                _leaseData[tokenId].collateral - collect
            );

            _carData[tokenId].treasury += collect;
        } else {
            _ready(tokenId);
        }
    }

    function repair(uint256 tokenId) external onlyInsuranceOperator(tokenId) {
        _ready(tokenId);
    }

    function _ready(uint256 tokenId) internal {
        changeConsumer(address(0), tokenId);

        delete _leaseData[tokenId];
    }

    function unlist(uint256 tokenId, bytes[] calldata signatures) external {
        require(
            _leaseData[tokenId].status == CarStatus.AVAILABLE ||
                _leaseData[tokenId].status == CarStatus.DAMAGED,
            "SHITS IN USE"
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
            uint256 amount = _carData[tokenId].ownershipContract.claim(signer);

            TransferHelper.safeTransferNative(signer, amount);

            unchecked {
                i++;
            }
        }

        require(
            total == _carData[tokenId].ownershipContract.totalSupply(),
            "EVERYONE!!!.gif"
        );

        _burn(tokenId);
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
