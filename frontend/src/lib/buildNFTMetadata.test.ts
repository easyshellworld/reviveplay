import { describe, expect, it, vi } from 'vitest';
import { buildNFTTokenURI, decodeTokenURI } from './buildNFTMetadata';

describe('buildNFTTokenURI', () => {
  it('builds metadata with provided values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T00:00:00.000Z'));

    const tokenURI = buildNFTTokenURI({
      nftName: 'Graduate NFT',
      description: 'Finished the tutorial',
      imageUrl: 'https://example.com/nft.png',
      ownerAddress: '0x1234',
      tokenId: 42,
    });
    const metadata = decodeTokenURI(tokenURI);

    expect(metadata).toMatchObject({
      name: 'Graduate NFT',
      description: 'Finished the tutorial',
      image: 'https://example.com/nft.png',
    });
    expect(metadata?.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ trait_type: 'Graduate', value: '0x1234' }),
        expect.objectContaining({ trait_type: 'Token ID', value: '42' }),
        expect.objectContaining({ trait_type: 'Mint Date', value: '2026-03-28' }),
      ]),
    );

    vi.useRealTimers();
  });

  it('falls back to default values when optional fields are empty', () => {
    const tokenURI = buildNFTTokenURI({
      nftName: '',
      description: '',
      imageUrl: '',
      ownerAddress: '0xabc',
      tokenId: 7,
    });
    const metadata = decodeTokenURI(tokenURI);

    expect(metadata).toMatchObject({
      name: 'Polkadot Revive Graduate #7',
      description: 'Awarded for completing the Polkadot Revive Playground tutorial on Polkadot Hub TestNet.',
      image: 'https://via.placeholder.com/500x500/E6007A/FFFFFF?text=PRPG+%237',
    });
  });
});
