import { useReadContract } from 'wagmi';

export function useTokenBalance({
  tokenAddress, accountAddress,
}: {
  tokenAddress?: `0x${string}`;
  accountAddress?: `0x${string}`;
}) {
  const { data: balance, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        "inputs": [
          { "internalType": "address", "name": "account", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: [accountAddress as `0x${string}`],
  });

  return { balance, refetch };
}
