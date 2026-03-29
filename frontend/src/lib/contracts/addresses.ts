// Pre-deployed contract addresses on Polkadot Hub TestNet (REVM).
// Read actual values through Vite env vars; fall back to zero address.

type HexAddress = `0x${string}`;

export const ZERO_ADDRESS: HexAddress = '0x0000000000000000000000000000000000000000';

const normalizeAddress = (value: string): HexAddress => {
  const formatted = value.trim();
  if (formatted.startsWith('0x') || formatted.startsWith('0X')) {
    return formatted as HexAddress;
  }
  return `0x${formatted}` as HexAddress;
};

const resolveAddress = (envValue?: string): HexAddress => {
  if (!envValue) return ZERO_ADDRESS;
  const normalized = envValue.trim();
  if (normalized.toLowerCase() === ZERO_ADDRESS) return ZERO_ADDRESS;
  return normalizeAddress(normalized);
};

const getEnvValue = (key: 'VITE_PLAYGROUND_NFT_ADDRESS' | 'VITE_TEACHING_SWAP_ROUTER_ADDRESS'): string | undefined => {
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
    return (import.meta.env as ImportMetaEnv & Record<string, string | undefined>)[key];
  }

  if (typeof process !== 'undefined') {
    return process.env[key];
  }

  return undefined;
};

export const PLAYGROUND_NFT_ADDRESS = resolveAddress(getEnvValue('VITE_PLAYGROUND_NFT_ADDRESS'));
export const TEACHING_SWAP_ROUTER_ADDRESS = resolveAddress(getEnvValue('VITE_TEACHING_SWAP_ROUTER_ADDRESS'));

export function isConfiguredContractAddress(address: string): boolean {
  return address.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
}
