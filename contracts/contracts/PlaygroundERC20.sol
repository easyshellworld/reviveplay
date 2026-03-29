// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/PlaygroundERC20.sol
// Runs on Polkadot Hub TestNet via Revive (REVM backend)
// TESTNET ONLY — Educational use. NOT for production.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlaygroundERC20
 * @notice A customizable ERC20 token for educational use.
 *         Deployed by learners on Polkadot Hub TestNet (REVM via Revive).
 * @dev Standard Solidity — runs on REVM without modification.
 */
contract PlaygroundERC20 is ERC20, Ownable {
    uint8 private immutable _tokenDecimals;

    event Minted(address indexed to, uint256 amount);

    /**
     * @param name_         Token name (e.g. "My Test Token")
     * @param symbol_       Token symbol (e.g. "MTT")
     * @param decimals_     Decimal places (0–18)
     * @param initialSupply Whole-unit initial supply (minted to initialOwner)
     * @param initialOwner  Owner of the contract and initial supply
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner
    )
        ERC20(name_, symbol_)
        Ownable(initialOwner)
    {
        _tokenDecimals = decimals_;
        _mint(initialOwner, initialSupply * (10 ** uint256(decimals_)));
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }

    /**
     * @notice Mint additional tokens (whole units). TESTNET ONLY — no cap.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * (10 ** uint256(_tokenDecimals)));
        emit Minted(to, amount);
    }
}
