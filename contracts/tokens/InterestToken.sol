// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/tokens/IInterestToken.sol";
import "../interfaces/strategies/earn-strategies/IEarnStrategy.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract InterestToken is ERC20, IInterestToken {
    uint256 internal constant MATH_UNITS = 1e20;

    address public override vault;

    /** @notice Strategy that is currently used for earnings */
    address public override earningsStrategy;

    /** @notice Store earn strategy balance for tracking interest accrual over time*/
    uint256 public override balanceAtIndex;

    /** @notice Vault Interest tracking index with accrual over time */
    uint256 public override interestIndex = MATH_UNITS;

    /** @notice Tracks Principal + Accruing Interest for every user */
    mapping(address => uint256) public override userIndex;

    modifier onlyVault() {
        require(msg.sender == vault, "InterestToken: ONLY_VAULT");
        _;
    }

    constructor(address vaultAddress, address earnStrategyAddress)
        ERC20("MAZELQK_TOKEN", "MZLK")
    {
        vault = vaultAddress;
        earningsStrategy = earnStrategyAddress;
    }

    /// @notice Creates `amount` tokens and assigns them to `account`, increasing the total supply.
    /// @param account The account that is depositing/borrowing
    /// @param amount The amount the account is depositing/borrowing
    function mint(address account, uint256 amount) external override onlyVault {
        _userSnapshot(account);

        _mint(account, amount);
        balanceAtIndex += amount;
    }

    /// @notice Creates `amount` tokens and assigns them to `account`, reducing the total supply.
    /// @param account The account that is withdrawing
    /// @param amount The amount the account is withdrawing
    function burn(address account, uint256 amount) external override onlyVault {
        _userSnapshot(account);

        uint256 accountBalance = super.balanceOf(account);
        if (amount > accountBalance) {
            amount = accountBalance;
        }

        _burn(account, amount);
        balanceAtIndex -= amount;
    }

    /// @notice Creates snapshot
    /// @dev This is needed to be able to account for the accrual of interest
    /// Through snapshotting the index is being accrued every time an action is taking place (deposit, withdraw)
    function snapshot() public override {
        (interestIndex, balanceAtIndex) = calcNewIndex();
        emit Snapshot(interestIndex, balanceAtIndex);
    }

    /// @notice Creates snapshot for the user state
    /// @dev This is needed to be able to account for the accrual of interest
    /// Through snapshotting the index is being accrued every time an action is taking place (deposit, withdraw)
    /// The user index is updated only when the user in partricular is taking action
    /// @param account The address of the actor
    function _userSnapshot(address account) internal {
        snapshot();
        uint256 _interestIndex = interestIndex;
        uint256 _userIndex = userIndex[account];

        if (_userIndex > 0) {
            // we are updating the index, so we have to bring the balance up to date
            // mint accrued balance - current balance
            uint256 balance = super.balanceOf(account);
            uint256 newBalance = ((balance * _interestIndex) / _userIndex);

            _mint(account, newBalance - balance);
        }

        userIndex[account] = _interestIndex;
    }

    /// @notice Calculates the accumulated balance of the user
    /// @return userBalance The balance of the user including the interesst being accrued over time
    function balanceOf(address account)
        public
        view
        override(ERC20, IERC20)
        returns (uint256 userBalance)
    {
        (uint256 currentIndex, ) = calcNewIndex();
        return balanceOfAtIndex(account, currentIndex);
    }

    /// @notice Calculates a given user balance at a specific index
    /// @param account The user to calculate the index for
    /// @param index The index to calculate the balance at
    /// @return userBalance The balance of the user in that index including the accumulated interest
    function balanceOfAtIndex(address account, uint256 index)
        public
        view
        returns (uint256 userBalance)
    {
        // userIndex[account] is not user balance, we're reusing the variable to save gas
        userBalance = userIndex[account];
        if (userBalance > 0) {
            userBalance = (super.balanceOf(account) * index) / userBalance;
        }
    }

    /// @notice Calculates the new index given the accrued interest and balance
    /// @notice The index is supposed only to goes up
    /// @dev New index is based on the total lending strategy balance and the current index
    /// @return interestIndex_ The new interest index
    /// @return balanceAtIndex_ The earn strategy balance for the new interest index
    function calcNewIndex()
        public
        view
        override
        returns (uint256 interestIndex_, uint256 balanceAtIndex_)
    {
        // Start with the old values
        interestIndex_ = interestIndex;
        balanceAtIndex_ = balanceAtIndex;

        uint256 balancePrev = balanceAtIndex_;
        uint256 balanceNew = IEarnStrategy(earningsStrategy).balanceOf();

        if (balancePrev > 0 && balancePrev < balanceNew) {
            // Increase the index proportionally to the balances:
            // gain = (new - old) / old
            // index = index + index * gain;
            uint256 newInterestIndex = interestIndex_ +
                ((interestIndex_ *
                    (((balanceNew - balancePrev) * MATH_UNITS) / balancePrev)) /
                    MATH_UNITS);

            // Keep track of the earn strategy balance, corresponding to the new index
            // Increase the balance for the previous index in the same proportion
            uint256 newBalanceAtIndex = (balancePrev * newInterestIndex) /
                interestIndex_;

            // Don't touch the index if the increase is too small to detect in abs sum
            if (newBalanceAtIndex > balanceAtIndex_) {
                balanceAtIndex_ = newBalanceAtIndex;
                interestIndex_ = newInterestIndex;
            }
        }
    }

    /// @notice On migration the vault should set the new earn strategy if any changes
    /// @param newStrategy The address of the new strategy
    function setEarningsStrategy(address newStrategy)
        external
        override
        onlyVault
    {
        earningsStrategy = newStrategy;
        emit SetEarningsStrategy(newStrategy);
    }

    /// @notice Transfer tokens on behalf of another user
    /// @param from The owner of the tokens
    /// @param to The recipient of the tokens
    /// @return amount The amount to be transferred
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override(ERC20, IERC20) returns (bool) {
        require(
            amount <= allowance(from, msg.sender),
            "InterestToken: NOT_ENOUGH_ALLOWANCE"
        );

        return _accrualTransfer(from, to, amount);
    }

    /// @notice Transfer tokens between 2 users
    /// @param to The recipient of the tokens
    /// @return amount The amount to be transferred
    function transfer(address to, uint256 amount)
        public
        override(ERC20, IERC20)
        returns (bool)
    {
        return _accrualTransfer(msg.sender, to, amount);
    }

    /// @notice Performs a transfer of interest tokens between 2 users by:
    /// 1. Snapshot the interest being accrued to this moment for both users
    /// 2. Process the transfer
    function _accrualTransfer(
        address sender,
        address receiver,
        uint256 amount
    ) internal returns (bool) {
        require(
            sender != receiver,
            "InterestToken: TRANSFER_BETWEEN_THE_SAME_ADDRESSES"
        );

        _userSnapshot(sender);
        _userSnapshot(receiver);

        uint256 balance = ERC20.balanceOf(sender);
        if (amount > balance) {
            amount = balance;
        }

        _transfer(sender, receiver, amount);
        return true;
    }
}
