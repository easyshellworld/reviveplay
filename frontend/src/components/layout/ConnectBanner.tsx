import React from 'react';
import { useAccount } from 'wagmi';

export const ConnectBanner: React.FC = () => {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="connect-banner mb-8">
      <span className="connect-banner-icon">💡</span>
      <div>
        <strong>开始前请先连接 MetaMask 钱包</strong> —
        本教学 DApp 将引导你完成：添加测试网 → 领取测试币 → 部署 ERC20 → 添加代币 → Swap 演示。
        <span className="tag testnet" style={{marginLeft: '6px'}}>教学演示</span>
      </div>
    </div>
  );
};
