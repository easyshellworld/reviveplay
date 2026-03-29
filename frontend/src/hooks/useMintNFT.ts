import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { PLAYGROUND_NFT_ADDRESS } from '@/lib/contracts/addresses';
import { PLAYGROUND_NFT_ABI } from '@/lib/contracts/abis';
import { wagmiConfig } from '@/lib/wagmi';
import { buildNFTTokenURI } from '@/lib/buildNFTMetadata';
import { decodeEventLog } from 'viem';

interface MintNFTParams {
  nftName: string;
  description: string;
  imageUrl: string;
  ownerAddress: `0x${string}`;
  nextTokenId: number;
}

export function useMintNFT() {
  const { writeContractAsync } = useWriteContract();

  const getMintedTokenId = (log: { data: `0x${string}`; topics: readonly `0x${string}`[] }) => {
    const decoded = decodeEventLog({
      abi: PLAYGROUND_NFT_ABI,
      data: log.data,
      topics: [...log.topics] as any,
    }) as { eventName?: string; args?: { tokenId?: bigint } };

    if (decoded.eventName !== 'NFTMinted') {
      return null;
    }

    return decoded.args?.tokenId ? Number(decoded.args.tokenId) : null;
  };

  const mintNFT = async ({
    nftName, description, imageUrl, ownerAddress, nextTokenId,
  }: MintNFTParams) => {
    try {
      const tokenURI = buildNFTTokenURI({ nftName, description, imageUrl, ownerAddress, tokenId: nextTokenId });

      const hash = await writeContractAsync({
        address: PLAYGROUND_NFT_ADDRESS,
        abi: PLAYGROUND_NFT_ABI,
        functionName: 'safeMint',
        args: [ownerAddress, tokenURI],
      } as any);

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 });

      const mintedLog = receipt.logs.find((log) => {
        try {
          return getMintedTokenId(log as { data: `0x${string}`; topics: readonly `0x${string}`[] }) !== null;
        } catch {
          return false;
        }
      });

      const mintedTokenId = mintedLog
        ? getMintedTokenId(mintedLog as { data: `0x${string}`; topics: readonly `0x${string}`[] }) ?? nextTokenId
        : nextTokenId;

      return { hash, receipt, mintedTokenId };
    } catch (error) {
      console.error('Mint error:', error);
      throw error;
    }
  };

  return { mintNFT };
}
