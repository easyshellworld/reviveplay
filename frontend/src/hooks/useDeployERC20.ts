import { useWalletClient, usePublicClient } from 'wagmi';
import { PLAYGROUND_ERC20_ABI } from '@/lib/contracts/abis';
import { PLAYGROUND_ERC20_BYTECODE } from '@/lib/contracts/bytecodes';

export function useDeployERC20() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const deploy = async ({
    name, symbol, decimals, initialSupply,
    onProgress,
  }: {
    name: string; symbol: string; decimals: number; initialSupply: bigint;
    onProgress?: (step: 1 | 2 | 3 | 4) => void;
  }): Promise<{ contractAddress: string; txHash: string }> => {
    if (!walletClient || !publicClient) throw new Error('Wallet not connected');

    try {
      onProgress?.(1);
      
      // Deploy contract
      const hash = await (walletClient as any).deployContract({
        abi: PLAYGROUND_ERC20_ABI,
        bytecode: PLAYGROUND_ERC20_BYTECODE,
        args: [name, symbol, decimals, initialSupply, walletClient.account.address],
      });

      onProgress?.(2);
      
      // Wait for receipt (1 confirmation)
      const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });

      onProgress?.(4);

      if (!receipt.contractAddress) {
        throw new Error('Deploy failed: no contract address in receipt');
      }

      return { 
        contractAddress: receipt.contractAddress, 
        txHash: hash 
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  };

  return { deploy };
}
