import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    polkadotHubTestnet: {
      url: "https://eth-rpc-testnet.polkadot.io/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 420420417,
    },
  },
  etherscan: {
    apiKey: {
      polkadotHubTestnet: "BLOCKSCOUT_API_KEY",
    },
    customChains: [
      {
        network: "polkadotHubTestnet",
        chainId: 420420417,
        urls: {
          apiURL: "https://blockscout-testnet.polkadot.io/api",
          browserURL: "https://blockscout-testnet.polkadot.io/",
        },
      },
    ],
  },
};

export default config;
