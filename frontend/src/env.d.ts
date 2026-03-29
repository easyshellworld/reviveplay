/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAYGROUND_NFT_ADDRESS?: string;
  readonly VITE_TEACHING_SWAP_ROUTER_ADDRESS?: string;
  readonly [key: string]: unknown;
}
