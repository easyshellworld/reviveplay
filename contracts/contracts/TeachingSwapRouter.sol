// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/TeachingSwapRouter.sol
// Pre-deployed by the Playground project on Polkadot Hub TestNet (REVM via Revive)
// Fixed-rate ERC20 → PAS swap for teaching the approve + swap pattern.
// WARNING: No slippage protection, no reentrancy guard — TESTNET ONLY.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TeachingSwapRouter
 * @notice A simplified fixed-rate swap: ERC20 tokens → PAS (native gas token).
 *         Demonstrates the two-step approve → swap interaction pattern on REVM.
 * @dev rate = token-wei per 1 PAS-wei. Default: 1000 (1000 MTT = 1 PAS).
 */
contract TeachingSwapRouter is Ownable {
    uint256 public rate;

    event Swapped(address indexed user, address indexed token, uint256 amountIn, uint256 amountOut);
    event RateUpdated(uint256 oldRate, uint256 newRate);

    error InvalidAmount();
    error InvalidRate();
    error InsufficientPASLiquidity();

    constructor(address initialOwner, uint256 initialRate) Ownable(initialOwner) {
        if (initialRate == 0) revert InvalidRate();
        rate = initialRate;
    }

    /**
     * @notice Swap ERC20 tokens for PAS.
     * @dev    MUST call token.approve(address(this), amountIn) first.
     * @param  token     ERC20 token address
     * @param  amountIn  Token amount in wei
     */
    function swap(address token, uint256 amountIn) external {
        if (amountIn == 0) revert InvalidAmount();
        uint256 amountOut = amountIn / rate;
        if (amountOut == 0) revert InvalidAmount();
        if (address(this).balance < amountOut) revert InsufficientPASLiquidity();

        IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        (bool sent, ) = payable(msg.sender).call{value: amountOut}("");
        require(sent, "PAS transfer failed");

        emit Swapped(msg.sender, token, amountIn, amountOut);
    }

    function setRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();
        emit RateUpdated(rate, newRate);
        rate = newRate;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function withdrawPAS(uint256 amount) external onlyOwner {
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "PAS withdraw failed");
    }

    function pasBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
