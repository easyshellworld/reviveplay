interface BuildNFTParams {
  nftName: string;
  description: string;
  imageUrl: string;
  ownerAddress: string;
  tokenId: number;
}

/**
 * Build an OpenSea-compatible NFT metadata JSON encoded as a data URI.
 * Using data URI avoids needing IPFS or any file hosting for testnet education.
 */
export function buildNFTTokenURI(params: BuildNFTParams): string {
  const { nftName, description, imageUrl, ownerAddress, tokenId } = params;

  const metadata = {
    name: nftName || `Polkadot Revive Graduate #${tokenId}`,
    description: description || 'Awarded for completing the Polkadot Revive Playground tutorial on Polkadot Hub TestNet.',
    image: imageUrl || `https://via.placeholder.com/500x500/E6007A/FFFFFF?text=PRPG+%23${tokenId}`,
    external_url: 'https://blockscout-testnet.polkadot.io/',
    attributes: [
      { trait_type: 'Course',        value: 'Polkadot Revive Playground' },
      { trait_type: 'Network',       value: 'Polkadot Hub TestNet' },
      { trait_type: 'VM Backend',    value: 'REVM (via Revive)' },
      { trait_type: 'Graduate',      value: ownerAddress },
      { trait_type: 'Token ID',      value: String(tokenId) },
      { trait_type: 'Mint Date',     value: new Date().toISOString().slice(0, 10) },
      { trait_type: 'Achievement',   value: 'First On-Chain NFT' },
    ],
  };

  const json = JSON.stringify(metadata);
  return `data:application/json;base64,${btoa(unescape(encodeURIComponent(json)))}`;
}

/**
 * Decode a data URI token URI back to metadata object (for preview).
 */
export function decodeTokenURI(tokenURI: string): Record<string, unknown> | null {
  try {
    if (!tokenURI.startsWith('data:application/json;base64,')) return null;
    const base64 = tokenURI.replace('data:application/json;base64,', '');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}
