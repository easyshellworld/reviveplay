import { useSwitchChain, useWalletClient } from 'wagmi';
import { polkadotHubTestnet } from '@/lib/wagmi';

export function useNetworkSwitch() {
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const addAndSwitchToPolkadot = async () => {
    try {
      await switchChainAsync({ chainId: polkadotHubTestnet.id });
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not in wallet — add it first
        await walletClient?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x18F82281',
            chainName: 'Polkadot Hub TestNet',
            nativeCurrency: { name: 'Paseo', symbol: 'PAS', decimals: 18 },
            rpcUrls: ['https://eth-rpc-testnet.polkadot.io/'],
            blockExplorerUrls: ['https://blockscout-testnet.polkadot.io/'],
          }],
        });
      } else if (err.code !== 4001) {
        throw err;
      }
    }
  };

  return { addAndSwitchToPolkadot };
}
