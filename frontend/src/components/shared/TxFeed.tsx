import React from 'react';
import { useAppStore } from '@/store/appStore';

export const TxFeed: React.FC = () => {
  const { txHistory } = useAppStore();
  const EXPLORER = 'https://blockscout-testnet.polkadot.io/tx/';

  if (txHistory.length === 0) {
    return (
      <div className="mt-4 py-4 text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">暂无交易记录</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-widest mb-3">
        交易记录
      </p>
      {txHistory.map((tx, i) => (
        <a
          key={i}
          href={`${EXPLORER}${tx.hash}`}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-between py-2 border-b border-[var(--border)]
                     text-xs hover:opacity-75 transition-opacity group"
        >
          <div className="flex items-center gap-2">
            <span className={`text-base leading-none ${
              tx.direction === 'in' ? 'text-[var(--success)]' : 'text-[var(--dot-pink)]'
            }`}>
              {tx.direction === 'in' ? '↓' : '↑'}
            </span>
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {tx.description}
            </span>
          </div>
          <span className="font-mono text-[var(--text-muted)]">
            {new Date(tx.timestamp).toLocaleTimeString()}
          </span>
        </a>
      ))}
    </div>
  );
};