import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const Header: React.FC = () => {
  const { isConnected, address, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const isCorrectNetwork = chainId === 420420417;

  return (
    <header className="sticky top-0 z-100 bg-[rgba(7,10,16,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] px-6 h-[96px] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="logo-dot-header">
          <div className="logo-dot-inner"></div>
        </div>
          <span className="text-[19px] font-bold text-white font-syne tracking-[-0.3px] leading-none">Polkadot Revive Playground</span>
        <span className="badge-beta">TESTNET</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="network-pill">
          <span className="net-dot" style={{
            backgroundColor: !isConnected ? 'var(--text-muted)' : 
              isCorrectNetwork ? 'var(--success)' : 'var(--warning)',
            animation: isConnected && isCorrectNetwork ? 'pulse 2s infinite' : 'none'
          }}></span>
          <span className="network-name">
            {!isConnected ? '未连接' : 
              isCorrectNetwork ? 'Polkadot Hub TestNet ✅' : `错误网络 · Chain ${chainId}`}
          </span>
        </div>
        
        {!isConnected ? (
          <button
            className="wallet-btn"
            onClick={() => connect({ connector: injected() })}
          >
            <span>🦊</span>
            <span>连接 MetaMask</span>
          </button>
        ) : (
          <button
            className="wallet-btn connected"
            onClick={() => disconnect()}
          >
            <span>{shortAddr}</span>
          </button>
        )}
      </div>
    </header>
  );
};
