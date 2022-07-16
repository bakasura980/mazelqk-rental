contract Vault is ERC721, IERC721Consumable {
    uint256 private _tokenCounter;
    uint256 private _collateralFactor;
    uint256 private _perDayFactor;

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

    constructor(uint256 collateralFactor_, uint256 perDayFactor_) {
        _collateralFactor = collateralFactor_;
        _perDayFactor = perDayFactor_;
    }

    function list(
        address[] calldata owners,
        uint256[] calldata shares,
        string tokenURI
    ) external returns (uint256) {
        uint256 tokenId = _mint(address(this), _tokenCounter++);

        // require shares 100
        // CarOwnership is ERC20 + rewards tracking
        carData[tokenId].ownershipContract = new CarOwnership(
            address(this),
            tokenId,
            owners[i],
            shares[i]
        );

        // TODO maybe mint it to the ERC20 and approve ourselves to set the renter
        return tokenId;
    }

    function liquidate(uint256 tokenId) external {
        require(block.timestamp > leaseData[tokenId].end, "not expired");
        // TODO fix math
        uint256 incentive = leaseData[tokenId].collateral * 0.01;
        _sendEth(msg.sender, incentive);
        leaseData[tokenId].collateral -= incentive;
        _setHealth(tokenId, 0);
    }

    function rent(uint256 tokenId) external payable {
        // exists?
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

        // TODO fix math
        uint256 actualRent = leaseData[tokenId].rent *
            (block.timestamp / leaseData[tokenId].end);

        carData[tokenId].treasury += actualRent;

        _sendEth(msg.sender, leaseData[tokenId].rent - actualRent);
    }

    // TODO look around for reentrancy
    function _sendEth(address wallet, uint256 amount) internal {
        require(amount > 0, "noop");

        (bool success, bytes memory returndata) = wallet.call{
            value: leaseData[tokenId].rent - actualRent
        }("");
        require(success, string(returndata));
    }

    function claim(uint256 tokenId) external {
        uint256 shares = carData[tokenId].ownershipContract.balanceOf(
            msg.sender
        );
        require(shares > 0, "not an owner");

        // (treasury - treasuryLast) * shares
        uint256 amount = carData[tokenId].ownershipContract.claimableFunds(
            carData[tokenId].treasury,
            msg.sender
        );

        (bool success, bytes memory returndata) = msg.sender.call{
            value: amount
        }("");
        require(success, string(returndata));
    }

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
        require(carData[tokenId].status == CarStatus.AVAILABLE
            || carData[tokenId].status == CarStatus.DAMAGED,
            "SHITS IN USE");

        // message is tokenId + IVault.unlist.selector

        uint256 total;
        for (uint256 i; i < signatures.length,) {
            // TODO recover address
            address signer;

            total += carData[tokenId].ownershipContract.balanceOf(signer);
            uint256 amount = carData[tokenId].ownershipContract.distribution(
                signer
            );

            _sendEth(signer, amount);

            unchecked {
                i++;
            }
        }

        require(total == 100, "EVERYONE!!!.gif");

        _burn(tokenId);
    }
}
