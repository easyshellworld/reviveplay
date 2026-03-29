import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';

interface SwapParams {
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  swapRouterAddress: `0x${string}`;
  amountIn: string;
  onStep?: (step: 1 | 2) => void;
}

export function useSwap() {
  const { writeContractAsync } = useWriteContract();

  const executeSwap = async ({
    tokenAddress, tokenDecimals,
    swapRouterAddress, amountIn,
    onStep,
  }: SwapParams) => {
    try {
      const amountWei = parseUnits(amountIn, tokenDecimals);

      // Step 1: Approve
      onStep?.(1);
      const approveTxHash = await writeContractAsync({
        address: tokenAddress,
        abi: [
          {
            "inputs": [
              { "internalType": "address", "name": "spender", "type": "address" },
              { "internalType": "uint256", "name": "value", "type": "uint256" }
            ],
            "name": "approve",
            "outputs": [
              { "internalType": "bool", "name": "", "type": "bool" }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [swapRouterAddress, amountWei],
      } as any);
      await waitForTransactionReceipt(wagmiConfig, { hash: approveTxHash, confirmations: 1 });

      // Step 2: Swap
      onStep?.(2);
      const swapTxHash = await writeContractAsync({
        address: swapRouterAddress,
        abi: [
          {
            "inputs": [
              { "internalType": "address", "name": "token", "type": "address" },
              { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
            ],
            "name": "swap",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'swap',
        args: [tokenAddress, amountWei],
      } as any);

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: swapTxHash, confirmations: 1 });

      return { approveTxHash, swapTxHash, receipt };
    } catch (error) {
      console.error('Swap error:', error);
      throw error;
    }
  };

  return { executeSwap };
}
