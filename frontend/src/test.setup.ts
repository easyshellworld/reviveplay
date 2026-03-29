import '@testing-library/jest-dom'

// Provide default environment variables for tests
// Tests run in Node.js context where process.env is available
// Application code uses import.meta.env, which Vite/Vitest should populate from process.env
if (typeof process !== 'undefined' && process.env) {
  process.env.VITE_PLAYGROUND_NFT_ADDRESS ??= '0x0000000000000000000000000000000000000001';
  process.env.VITE_TEACHING_SWAP_ROUTER_ADDRESS ??= '0x0000000000000000000000000000000000000002';
}
