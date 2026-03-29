import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatEther } from 'viem';
import { useNetworkSwitch } from '@/hooks/useNetworkSwitch';

export const Step01Connect: React.FC = () => {
  const { isConnected, address, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { addAndSwitchToPolkadot } = useNetworkSwitch();
  const { data: balance } = useBalance({ address });

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleAddNetwork = async () => {
    await addAndSwitchToPolkadot();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div>
      <div className="content-block">
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12h20M12 2v20" stroke="var(--polkadot-secondary)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Polkadot Hub TestNet 参数
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Chain ID', value: '420420417', color: 'var(--polkadot-primary)' },
            { label: 'Currency', value: 'PAS (Paseo)', color: 'var(--success)' },
            { label: 'VM Backend', value: 'REVM (via Revive)', color: 'var(--dot-purple)' },
            { label: 'RPC URL', value: 'https://eth-rpc-testnet.polkadot.io/', color: 'var(--text-primary)' },
            { label: 'Explorer', value: 'blockscout-testnet.polkadot.io', color: 'var(--text-primary)' },
          ].map(param => (
            <div key={param.label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-xs text-[var(--text-secondary)]">{param.label}</span>
              <span className="font-mono text-xs" style={{ color: param.color }}>{param.value}</span>
            </div>
          ))}
        </div>
        <button 
          className="btn btn-secondary mt-4" 
          onClick={handleAddNetwork}
        >
          ➕ 添加到 MetaMask
        </button>
      </div>

      <div className="content-block mt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-[var(--dot-pink-dim)] flex items-center justify-center">
            <div className="text-2xl">🦊</div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">MetaMask 钱包</h3>
            <p className="text-sm text-[var(--text-secondary)]">连接到 Polkadot Hub TestNet</p>
          </div>
        </div>

        {!isConnected ? (
          <button 
            className="btn btn-metamask w-full"
            onClick={handleConnect}
          >
            🚀 连接 MetaMask
          </button>
        ) : (
          <div className="space-y-4">
            <div className="address-box">
              <div>
                <div className="address-label">地址</div>
                <div className="address-value">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
              </div>
              <button 
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(address || '')}
              >
                复制
              </button>
            </div>
            <div className="address-box">
              <div>
                <div className="address-label">网络</div>
                <div className="address-value">Chain ID: {chainId}</div>
              </div>
            </div>
            <div className="balance-box">
              <div>
                <div className="balance-label">PAS 余额</div>
              </div>
              <div className="balance-value">
                <span className="balance-amount">
                  {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '—'}
                </span>
                <span className="balance-unit">PAS</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="btn btn-secondary"
                style={{ minWidth: '120px' }}
                onClick={handleAddNetwork}
              >
                🔄 切换网络
              </button>
              <button 
                className="btn btn-secondary"
                style={{ minWidth: '120px', borderColor: 'var(--error)', color: 'var(--error)' }}
                onClick={handleDisconnect}
              >
                ➖ 断开连接
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
