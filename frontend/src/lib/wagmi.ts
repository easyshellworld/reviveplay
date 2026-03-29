import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-testnet.polkadot.io/'],
    },
    fallback: {
      http: ['https://services.polkadothub-rpc.com/testnet/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-testnet.polkadot.io',
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
});
