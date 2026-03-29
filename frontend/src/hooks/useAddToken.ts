import { useWalletClient } from 'wagmi';

export function useAddToken() {
  const { data: walletClient } = useWalletClient();

  const addERC20 = async ({
    address, symbol, decimals,
  }: { address: `0x${string}`; symbol: string; decimals: number }) => {
    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address, symbol, decimals },
      },
    });
  };

  const addERC721 = async ({
    address, tokenId,
  }: { address: `0x${string}`; tokenId: string }) => {
    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: { address, tokenId },
      },
    } as any);
  };

  return { addERC20, addERC721 };
}
