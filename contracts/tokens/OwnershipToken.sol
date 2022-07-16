// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../Vault.sol";

contract OwnershipToken is ERC20 {
    Vault private _vault;
    uint256 private _carToken;

    mapping(address => uint256) public userClaimed;

    mapping(address => uint256) public userSnapshotClaimable;
    mapping(address => uint256) public userSnapshotTreasury;

    uint256 internal constant TOTAL_SHARES = 100e18;

    constructor(
        Vault vault_,
        uint256 carToken_,
        address[] memory owners_,
        uint256[] memory shares_
    )
        ERC20(
            string(
                abi.encodePacked(
                    "Car ownership token ",
                    Strings.toString(carToken_)
                )
            ),
            string(abi.encodePacked("C", Strings.toString(carToken_)))
        )
    {
        require(owners_.length == shares_.length, "negramotnik");
        require(owners_.length <= 10, "mnogo ste");

        for (uint256 i; i < owners_.length; ) {
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
        userSnapshotTreasury[wallet] = _vault.carData(_carToken).treasury;
    }

    function _calculateCurrent(address wallet) internal returns (uint256) {
        uint256 shares = balanceOf(wallet);
        return
            ((_vault.carData(_carToken).treasury -
                userSnapshotTreasury[wallet]) * shares) / TOTAL_SHARES;
    }

    function claimable(address wallet) public view returns (uint256) {
        return
            userSnapshotClaimable[wallet] +
            _calculateCurrent(wallet) -
            userClaimed[wallet];
    }

    function claim(address wallet) public returns (uint256) {
        // snapshot(wallet); not needed?
        uint256 amount = claimable(wallet);
        userClaimed[wallet] += amount;
        return amount;
    }
}
