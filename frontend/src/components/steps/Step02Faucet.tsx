import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export const Step02Faucet: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });

  return (
    <div>
      <div className="content-block">
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.5L7 10H17L12 2.5Z" fill="var(--polkadot-secondary)" />
            <path d="M12 21.5L17 14H7L12 21.5Z" fill="var(--polkadot-secondary)" />
          </svg>
          领取测试代币
        </h4>
        <p>部署合约需要 PAS 作为 Gas 费，点击下方水龙头链接，领取测试代币。</p>
        
        <div className="link-item">
          <span className="address-label">官方水龙头</span>
          <a 
            href="https://faucet.polkadot.io/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--polkadot-primary-light)] no-underline text-sm inline-flex items-center gap-1.5 transition-all border-b border-transparent hover:border-[var(--polkadot-primary-light)]"
          >
            领取 PAS 测试币
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <div style={{marginTop: 4}}>
            <code style={{color: 'var(--text-secondary)', fontSize: 13}}>https://faucet.polkadot.io/</code>
          </div>
        </div>

        <div className="link-item" style={{marginTop: 20}}>
          <span className="address-label">Blockscout</span>
          <a 
            href="https://blockscout-testnet.polkadot.io/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--polkadot-primary-light)] no-underline text-sm inline-flex items-center gap-1.5 transition-all border-b border-transparent hover:border-[var(--polkadot-primary-light)]"
          >
            查询交易记录
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <div style={{marginTop: 4}}>
            <code style={{color: 'var(--text-secondary)', fontSize: 13}}>https://blockscout-testnet.polkadot.io/</code>
          </div>
        </div>
      </div>

      {isConnected && (
        <div>
          <div className="address-label">您的地址</div>
          <div className="address-box">
            <div>
              <div className="address-value">{address}</div>
            </div>
            <button 
              className="btn-copy"
              onClick={() => navigator.clipboard.writeText(address || '')}
            >
              复制
            </button>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="balance-box">
          <div>
            <div className="balance-label">PAS 余额 (Gas 代币余额)</div>
          </div>
          <div className="balance-value">
            <span className="balance-amount">
              {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '—'}
            </span>
            <span className="balance-unit">PAS</span>
            <button 
              className="btn-refresh"
              onClick={() => refetchBalance()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5 2V8M21.5 8H15.5M21.5 8C19.8333 5.1 16.1667 2.5 12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 17.25 6.75 21.5 12 21.5C16.1667 21.5 19.8333 18.9 21.5 16M2.5 22V16M2.5 16H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
