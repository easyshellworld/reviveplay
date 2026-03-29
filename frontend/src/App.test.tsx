import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';

const testChain = defineChain({
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
});

const testConfig = createConfig({
  chains: [testChain],
  connectors: [],
  transports: {
    [testChain.id]: http('http://127.0.0.1:8545'),
  },
});

const queryClient = new QueryClient();

// Mock the ConnectBanner component
vi.mock('@/components/layout/ConnectBanner', () => ({
  ConnectBanner: () => <div data-testid="mock-connect-banner">Mock Connect Banner</div>,
}));

// Mock all step components
vi.mock('@/components/steps/Step01Connect', () => ({
  Step01Connect: () => <div>Step 01 Content</div>,
}));

vi.mock('@/components/steps/Step02Faucet', () => ({
  Step02Faucet: () => <div>Step 02 Content</div>,
}));

vi.mock('@/components/steps/Step03DeployERC20', () => ({
  Step03DeployERC20: () => <div>Step 03 Content</div>,
}));

vi.mock('@/components/steps/Step04AddToken', () => ({
  Step04AddToken: () => <div>Step 04 Content</div>,
}));

vi.mock('@/components/steps/Step05Swap', () => ({
  Step05Swap: () => <div>Step 05 Content</div>,
}));

vi.mock('@/components/steps/Step06MintNFT', () => ({
  Step06MintNFT: () => <div>Step 06 Content</div>,
}));

// Mock ProgressSteps
vi.mock('@/components/shared/ProgressSteps', () => ({
  ProgressSteps: () => <div data-testid="mock-progress-steps">Progress Steps</div>,
}));

// Mock ToastProvider
vi.mock('@/components/shared/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App from './App';

describe('App component', () => {
  it('renders the core teaching flow layout', () => {
    render(
      <WagmiProvider config={testConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    );

    expect(screen.getByText('跟随以下步骤完成完整的 Web3 学习体验')).toBeInTheDocument();
    expect(screen.getByTestId('mock-connect-banner')).toBeInTheDocument();
    expect(screen.getByTestId('mock-progress-steps')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(
      <WagmiProvider config={testConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    );

    expect(screen.getByText('上一步')).toBeInTheDocument();
    expect(screen.getByText('重置进度')).toBeInTheDocument();
    expect(screen.getByText('下一步')).toBeInTheDocument();
  });
});
