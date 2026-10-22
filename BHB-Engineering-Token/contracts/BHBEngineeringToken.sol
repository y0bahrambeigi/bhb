// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title BHB Engineering Token
/// @author Yousef Bahram Beigi
/// @notice ERC-20 test token for engineering, research, and educational use.
/// @dev The initial owner receives 100 million BHB. The owner may mint at most
///      20 million additional BHB over the lifetime of the contract. Burning
///      tokens does not restore the additional mint allowance.
contract BHBEngineeringToken is
    ERC20,
    ERC20Burnable,
    ERC20Capped,
    ERC20Pausable,
    Ownable2Step
{
    uint256 public constant INITIAL_SUPPLY = 100_000_000 ether;
    uint256 public constant MAX_ADDITIONAL_MINT = 20_000_000 ether;
    uint256 public constant MAX_SUPPLY = INITIAL_SUPPLY + MAX_ADDITIONAL_MINT;

    /// @notice Cumulative amount minted after deployment.
    /// @dev This value never decreases, including after token burns.
    uint256 public additionalMinted;

    error AdditionalMintAllowanceExceeded(uint256 requested, uint256 remaining);
    error CannotRenounceOwnershipWhilePaused();

    event AdditionalTokensMinted(
        address indexed recipient,
        uint256 amount,
        uint256 cumulativeAdditionalMinted
    );

    constructor(address initialOwner)
        ERC20("BHB Engineering Token", "BHB")
        ERC20Capped(MAX_SUPPLY)
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /// @notice Mint BHB to a recipient, within the lifetime 20-million allowance.
    /// @param recipient Address receiving newly minted BHB.
    /// @param amount Amount in the smallest unit (18 decimals).
    function mint(address recipient, uint256 amount) external onlyOwner {
        uint256 remaining = remainingMintAllowance();
        if (amount > remaining) {
            revert AdditionalMintAllowanceExceeded(amount, remaining);
        }

        additionalMinted += amount;
        _mint(recipient, amount);

        emit AdditionalTokensMinted(recipient, amount, additionalMinted);
    }

    /// @notice Remaining lifetime allowance for owner-controlled minting.
    function remainingMintAllowance() public view returns (uint256) {
        return MAX_ADDITIONAL_MINT - additionalMinted;
    }

    /// @notice Stop transfers, minting, and burning in an emergency.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume transfers, minting, and burning.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Permanently remove the owner only while operations are active.
    /// @dev Prevents an irreversible freeze caused by renouncing while paused.
    function renounceOwnership() public override onlyOwner {
        if (paused()) {
            revert CannotRenounceOwnershipWhilePaused();
        }
        super.renounceOwnership();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
