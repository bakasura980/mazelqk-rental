// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./Errors.sol";

import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";

library TransferHelper {
    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20Minimal.transfer.selector, to, value)
        );
        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert Errors.TH_SAFE_TRANSFER_FAILED();
        }
    }

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(
                IERC20Minimal.transferFrom.selector,
                from,
                to,
                value
            )
        );
        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert Errors.TH_SAFE_TRANSFER_FROM_FAILED();
        }
    }

    /// @notice Approves the stipulated contract to spend the given allowance in the given token
    /// @dev Errors with 'SA' if transfer fails
    /// @param token The contract address of the token to be approved
    /// @param to The target of the approval
    /// @param value The amount of the given token the target will be allowed to spend
    function safeApprove(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20Minimal.approve.selector, to, value)
        );
        if (!success || (data.length > 0 && !abi.decode(data, (bool)))) {
            revert Errors.TH_SAFE_APPROVE();
        }
    }

    function safeTransferNative(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        if (!success) {
            revert Errors.TH_SAFE_TRANSFER_NATIVE_FAILED();
        }
    }
}
