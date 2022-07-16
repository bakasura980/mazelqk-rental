// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../libraries/TransferHelper.sol";
import "../interfaces/tokens/IOwnershipToken.sol";

contract OwnershipToken is ERC20, IOwnershipToken {
    uint256 public rentBalance;

    mapping(address => uint256) public userClaimed;

    mapping(address => uint256) public userSnapshotTreasury;
    mapping(address => uint256) public userSnapshotClaimable;

    uint256 internal constant TOTAL_SHARES = 100e18;

    constructor(
        uint256 tokenId,
        address[] memory owners,
        uint256[] memory shares
    )
        ERC20(
            string(
                abi.encodePacked(
                    "Car ownership token ",
                    Strings.toString(tokenId)
                )
            ),
            string(abi.encodePacked("COT", Strings.toString(tokenId)))
        )
    {
        require(owners.length <= 10, "OwnershipToken: TOO_MANY_OWNERS");
        require(
            owners.length == shares.length,
            "OwnershipToken: SHARES_NOT_ENOUGH"
        );

        for (uint256 i; i < owners.length; ) {
            _mint(owners[i], shares[i]);

            unchecked {
                i++;
            }
        }

        require(
            totalSupply() == TOTAL_SHARES,
            "OwnershipToken: MISSING_SHARES"
        );
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 /* amount */
    ) internal override {
        snapshot(from);
        snapshot(to);
    }

    function snapshot(address account) public {
        userSnapshotClaimable[account] += _calculateCurrent(account);
        userSnapshotTreasury[account] = rentBalance;
    }

    function claimable(address account) public view returns (uint256) {
        return
            userSnapshotClaimable[account] +
            _calculateCurrent(account) -
            userClaimed[account];
    }

    function _calculateCurrent(address account)
        internal
        view
        returns (uint256)
    {
        uint256 shares = balanceOf(account);
        return
            ((rentBalance - userSnapshotTreasury[account]) * shares) /
            TOTAL_SHARES;
    }

    function claim(address to, uint256 amount) external returns (uint256) {
        require(
            amount <= claimable(msg.sender),
            "OwnershipToken: NOT_ENOUGH_TO_CLAIM"
        );

        userClaimed[msg.sender] += amount;
        TransferHelper.safeTransferNative(to, amount);

        emit Claim(msg.sender, to, amount);
    }

    function receiveRent() external payable {
        rentBalance += msg.value;
        emit ReceiveRent(rentBalance, msg.value);
    }
}
