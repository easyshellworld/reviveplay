import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CodeViewer } from '@/components/shared/CodeViewer';
import { TxFeed } from '@/components/shared/TxFeed';
import { useAppStore } from '@/store/appStore';
import { useSwap } from '@/hooks/useSwap';
import {
  TEACHING_SWAP_ROUTER_ADDRESS,
  isConfiguredContractAddress,
} from '@/lib/contracts/addresses';
import { generateSwapCodeHTML } from '@/lib/codeGen';
import { useTokenBalance } from '@/hooks/useTokenBalance';

export const Step05Swap: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { erc20Address, erc20Symbol, erc20Decimals, addTxRecord } = useAppStore();
  const { executeSwap } = useSwap();

  const [amount, setAmount] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [swapStep, setSwapStep] = useState<0 | 1 | 2>(0);
  const isSwapConfigured = isConfiguredContractAddress(TEACHING_SWAP_ROUTER_ADDRESS);
  
  const { balance: erc20Balance } = useTokenBalance({
    tokenAddress: erc20Address as `0x${string}`,
    accountAddress: address,
  });

  const handleSwap = async () => {
    if (!erc20Address || !amount || !address) return;

    setSwapping(true);
    setSwapStep(0);
    try {
      const { swapTxHash } = await executeSwap({
        tokenAddress: erc20Address as any,
        tokenDecimals: erc20Decimals,
        swapRouterAddress: TEACHING_SWAP_ROUTER_ADDRESS,
        amountIn: amount,
        onStep: (step) => setSwapStep(step as 1 | 2),
      });

      addTxRecord({
        type: 'swap',
        description: 'ERC20 兑换 PAS',
        hash: swapTxHash,
        amount,
        direction: 'out',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setSwapping(false);
      setSwapStep(0);
    }
  };

  const displayERC20Balance = erc20Balance !== undefined
    ? (Number(erc20Balance) / 10 ** erc20Decimals).toLocaleString()
    : '0';

  const swapCode = generateSwapCodeHTML({
    tokenAddress: erc20Address ?? '',
    routerAddress: TEACHING_SWAP_ROUTER_ADDRESS,
    amount,
    decimals: erc20Decimals,
    symbol: erc20Symbol,
  });

  if (!erc20Address) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 opacity-50">⚠️</div>
        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">请先部署 ERC20 合约</h4>
        <p className="text-[var(--text-secondary)]">部署后可以体验 Swap 功能</p>
      </Card>
    );
  }

  if (!isSwapConfigured) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 opacity-50">🛠️</div>
        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Swap Router 尚未配置</h4>
        <p className="text-[var(--text-secondary)]">
          请在项目根目录的 `.env` 中设置 <code className="font-mono">VITE_TEACHING_SWAP_ROUTER_ADDRESS</code>，然后重新启动。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="callout callout-pink">
        <span className="callout-icon">🔐</span>
        <p>
          Swap 分为两步：<strong>Step 1 Approve</strong>（授权 Router 使用你的代币）→
          <strong>Step 2 Swap</strong>（Router 收走代币，返还 PAS）。两步各需 MetaMask 确认一次。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card glow>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Swap 演示</h3>
          
          {/* From 字段 */}
          <div className="bg-[var(--bg-card2)] rounded-xl p-4 mb-2">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">从</span>
              <span className="text-xs text-[var(--text-secondary)]">
                余额: {displayERC20Balance} {erc20Symbol}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                className="flex-1 bg-transparent text-2xl font-bold text-[var(--text-primary)]
                           outline-none placeholder:text-[var(--text-muted)] font-[var(--font-mono)]"
                placeholder="0.0"
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={!isConnected || swapping}
              />
              <button
                onClick={() => setAmount(displayERC20Balance)}
                className="text-xs px-2 py-1 rounded bg-[var(--dot-pink-dim)] text-[var(--dot-pink)]
                           hover:bg-[rgba(230,0,122,0.25)] transition-colors font-bold"
                disabled={!isConnected || swapping}
              >
                MAX
              </button>
              <span className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-mono)]">
                {erc20Symbol}
              </span>
            </div>
          </div>

          {/* ↕ 分隔符 */}
          <div className="flex justify-center my-2">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-card2)] border border-[var(--border)]
                          flex items-center justify-center text-[var(--text-secondary)] text-sm
                          hover:border-[var(--dot-pink)] transition-colors cursor-default select-none">
              ↕
            </div>
          </div>

          {/* To 字段 */}
          <div className="bg-[var(--bg-card2)] rounded-xl p-4 mb-4">
            <div className="mb-2">
              <span className="text-xs text-[var(--text-secondary)]">到（预计）</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-1 text-2xl font-bold text-[var(--success)] font-[var(--font-mono)]">
                {amount && Number(amount) > 0 ? (Number(amount) / 1000).toFixed(6) : '0.0'}
              </span>
              <span className="text-sm font-bold text-[var(--success)] font-[var(--font-mono)]">PAS</span>
            </div>
          </div>

          {/* 汇率说明 */}
          <p className="text-xs text-center text-[var(--text-secondary)] mb-4 font-mono">
            汇率：1000 {erc20Symbol} = 1 PAS（固定汇率 · 教学演示）
          </p>

          {/* Swap 按钮 */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwap}
              disabled={!isConnected || swapping || !amount}
              loading={swapping}
              size="xl"
              className="min-w-[400px]"
            >
              {swapStep === 0 && '⚡ 执行 Swap（两步：Approve + Swap）'}
              {swapStep === 1 && '⏳ Step 1/2: 等待 Approve 确认...'}
              {swapStep === 2 && '⏳ Step 2/2: 等待 Swap 确认...'}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CodeViewer code={swapCode} filename="approve-and-swap.ts" />
          </Card>
          
          <Card>
            <TxFeed />
          </Card>
        </div>
      </div>
    </div>
  );
};