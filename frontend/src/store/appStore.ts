import { create } from 'zustand';

interface TxRecord {
  type: string;
  description: string;
  hash: string;
  amount: string;
  direction: 'in' | 'out';
  timestamp: number;
}

interface MintedNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  txHash: string;
}

interface AppStore {
  // ERC20 state
  erc20Address: string | null;
  erc20Symbol: string;
  erc20Name: string;
  erc20Decimals: number;
  setERC20(address: string, symbol: string, name: string, decimals: number): void;

  // NFT state
  mintedNFT: MintedNFT | null;
  setMintedNFT(nft: MintedNFT): void;

  // TX history
  txHistory: TxRecord[];
  addTxRecord(record: TxRecord): void;
}

export const useAppStore = create<AppStore>((set) => ({
  erc20Address: null,
  erc20Symbol: 'MTT',
  erc20Name: 'My Test Token',
  erc20Decimals: 18,
  setERC20: (address, symbol, name, decimals) =>
    set({ erc20Address: address, erc20Symbol: symbol, erc20Name: name, erc20Decimals: decimals }),

  mintedNFT: null,
  setMintedNFT: (nft) => set({ mintedNFT: nft }),

  txHistory: [],
  addTxRecord: (record) =>
    set((s) => ({ txHistory: [record, ...s.txHistory].slice(0, 20) })),
}));
