// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/PlaygroundNFT.sol
// Pre-deployed by the Playground project on Polkadot Hub TestNet (REVM via Revive)
// OPEN MINT — anyone can call safeMint to receive a graduation NFT.
// TESTNET ONLY — Educational use.

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlaygroundNFT
 * @notice Pre-deployed ERC-721 graduation NFT for Polkadot Revive Playground.
 *         Open mint: any address may call safeMint() to receive a certificate NFT.
 *         Token metadata is supplied as a data-URI (base64-encoded JSON) by the frontend.
 * @dev Standard Solidity — runs on REVM backend (Revive / pallet-revive).
 */
contract PlaygroundNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    /// @notice Maximum NFTs a single address can mint (anti-spam)
    uint256 public maxPerWallet = 5;

    mapping(address => uint256) public mintedPerWallet;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    error ExceedsMaxPerWallet(address minter, uint256 current, uint256 max);

    constructor(address initialOwner)
        ERC721("Polkadot Revive Playground Graduate", "PRPG")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint a graduation NFT. Open to any address (up to maxPerWallet).
     * @param to        Recipient address (usually msg.sender)
     * @param tokenUri  data:application/json;base64,... metadata URI built by frontend
     * @return tokenId  The newly minted token ID (starts at 1)
     */
    function safeMint(address to, string calldata tokenUri)
        external
        returns (uint256 tokenId)
    {
        if (mintedPerWallet[msg.sender] >= maxPerWallet)
            revert ExceedsMaxPerWallet(msg.sender, mintedPerWallet[msg.sender], maxPerWallet);

        _tokenIdCounter++;
        tokenId = _tokenIdCounter;
        mintedPerWallet[msg.sender]++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        emit NFTMinted(to, tokenId, tokenUri);
    }

    /**
     * @notice Total NFTs minted across all users.
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Next token ID that will be assigned.
     */
    function nextTokenId() external view returns (uint256) {
        return _tokenIdCounter + 1;
    }

    /**
     * @notice Owner can update the per-wallet limit.
     */
    function setMaxPerWallet(uint256 newMax) external onlyOwner {
        maxPerWallet = newMax;
    }
}
