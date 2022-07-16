// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

// if we dont use enumberable switch it to erc721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./tokens/OwnershipToken.sol";
import "./tokens/ERC721Consumable.sol";

contract Vault is ERC721Enumerable, ERC721Consumable {
    uint256 private _tokenCounter;
    uint256 private _collateralFactor;
    uint256 private _perDayFactor;
    // 0.01
    uint256 internal constant INCENTIVE_FACTOR = 1e16;

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) private _tokenDAOs;

    struct CarData {
        address ownershipContract;
        bool available;
        uint256 price;
        // running total
        uint256 treasury;
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

    constructor(uint256 collateralFactor_, uint256 perDayFactor_)
        ERC721("", "") {
        _collateralFactor = collateralFactor_;
        _perDayFactor = perDayFactor_;
    }

    function ownerOf(uint256 tokenId) public view override(ERC721, IERC721, ERC721Consumable) returns (address) {
        return ERC721Enumerable.ownerOf(tokenId);
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
        string calldata tokenURI_,
        address daoAddress
    ) external returns (uint256) {
        uint256 tokenId = _mint(address(this), _tokenCounter++);

        carData[tokenId].ownershipContract = new OwnershipToken(
            address(this),
            tokenId,
            owners,
            shares
        );

        _tokenURIs[tokenId] = tokenURI_;
        _tokenDAOs[tokenId] = daoAddress;

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

    function rent(uint256 tokenId) external payable {
        require(_exists(tokenId), "no");

        // por que no los dos
        // require rent less than 20% collateral
        require(consumerOf(tokenId) == address(0), "already rented");
        require(
            leaseData[tokenId].status == CarStatus.AVAILABLE,
            "already rented"
        );

        leaseData[tokenId].collateral =
            carData[tokenId].price *
            _collateralFactor;
        leaseData[tokenId].rent = msg.value - leaseData[tokenId].collateral;

        uint256 duration = (leaseData[tokenId].rent / carData[tokenId].price) *
            _perDayFactor *
            24 *
            60 *
            60;
        require(duration > 0, "fuck off");

        leaseData[tokenId].start = block.timestamp;
        leaseData[tokenId].end = block.timestamp + duration;

        changeConsumer(msg.sender, tokenId);
    }

    function extend(uint256 tokenId) external payable {
        // require total rent less than 20% collateral

        uint256 duration = (msg.value / carData[tokenId].price) *
            _perDayFactor *
            24 *
            60 *
            60;

        require(duration > 0, "fuck off");
        leaseData[tokenId].end = block.timestamp + duration;
        leaseData[tokenId].rent += msg.value;
    }

    function returnreturn(uint256 tokenId) external {
        require(msg.sender == consumerOf(tokenId), "not yours you fuck");
        require(leaseData[tokenId].end >= block.timestamp, "out of time");

        leaseData[tokenId].status = CarStatus.RETURNED;
        leaseData[tokenId].returned = block.timestamp;

        uint256 maxDuration = leaseData[tokenId].end - leaseData[tokenId].start;
        uint256 actualDuration = leaseData[tokenId].returned -
            leaseData[tokenId].start;
        uint256 actualRent = (leaseData[tokenId].rent * actualDuration) /
            maxDuration;

        carData[tokenId].treasury += actualRent;

        _sendEth(msg.sender, leaseData[tokenId].rent - actualRent);
    }

    // TODO look around for reentrancy
    function _sendEth(address wallet, uint256 amount) internal {
        require(amount > 0, "noop");

        (bool success, bytes memory returndata) = wallet.call{
            value: amount
        }("");
        require(success, string(returndata));
    }

    function claim(uint256 tokenId) external {
        // it'll just be 0, let them waste gas
        // uint256 shares = carData[tokenId].ownershipContract.balanceOf(
        //     msg.sender
        // );
        // require(shares > 0, "not an owner");

        uint256 amount = carData[tokenId].ownershipContract.claim(
            carData[tokenId].treasury,
            msg.sender
        );

        if (amount > 0) {
            (bool success, bytes memory returndata) = msg.sender.call{
                value: amount
            }("");
            require(success, string(returndata));
        }
    }

    function damageReport(uint256 tokenId, uint256 health) external onlyDao(tokenId) {
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

    function repair(uint256 tokenId) external onlyDao(tokenId) {
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
            address signer = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(abi.encode(tokenId, Vault.unlist.selector))
                ),
                signatures[i]
            );

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

    modifier onlyDao(uint256 tokenId) {
        require(msg.sender == _tokenDAOs[tokenId], "samo na6i ora");
        _;
    }
}
