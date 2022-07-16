pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OwnershipToken is ERC20 {
    address private _vault;
    address private _carToken;
    mapping(address => uint256) treasuryIndex;

    mapping(address => uint256) userClaimed;

    mapping(address => uint256) userSnapshotClaimable;
    mapping(address => uint256) userSnapshotTreasury;

    uint256 internal constant TOTAL_SHARES = 100e18;

    constructor(
        address vault_,
        address carToken_,
        address[] owners_,
        uint256[] shares_
    ) {
        require(owners_.length == shares_.length, "negramotnik");

        for (uint256 i; i < owners.length; ) {
            _mint(owners_[i], shares_[i]);

            unchecked {
                i++;
            }
        }

        require(totalSupply() == TOTAL_SHARES, "nau4i se da smqta6");

        _vault = vault_;
        _carToken = carToken_;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        snapshot(from);
        snapshot(to);
    }

    function snapshot(address wallet) public {
        userSnapshotClaimable[wallet] += _calculateCurrent(wallet);
        userSnapshotTreasury[wallet] = _vault.carData[_carToken].treasury;
    }

    function _calculateCurrent(address wallet) internal returns (uint256) {
        uint256 shares = balanceOf(wallet);
        return
            amount =
                ((_vault.carData[_carToken].treasury -
                    userSnapshotTreasury[wallet]) * shares) /
                TOTAL_SHARES;
    }

    function claimable(address wallet) public view returns (uint256) {
        return
            userClaimed[wallet] -
            (userSnapshotClaimable[wallet] + _calculateCurrent(wallet));
    }

    function claim(address wallet) public returns (uint256) {
        uint256 amount = claimable(wallet);
        userClaimed[wallet] += amount;
        return amount;
    }
}
