import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ProgressSteps } from '@/components/shared/ProgressSteps';
import { CodeViewer } from '@/components/shared/CodeViewer';
import { useDeployERC20 } from '@/hooks/useDeployERC20';
import { useAppStore } from '@/store/appStore';
import { generateERC20SolidityHTML } from '@/lib/codeGen';
import { parseWholeUnits } from '@/lib/token';

// Card, Input, Button imports removed - using direct styling matching yangshi.html

export const Step03DeployERC20: React.FC = () => {
  const { isConnected } = useAccount();
  const { deploy } = useDeployERC20();
  const { setERC20, addTxRecord } = useAppStore();

  const [tokenName, setTokenName] = useState('My Test Token');
  const [tokenSymbol, setTokenSymbol] = useState('MTT');
  const [tokenDecimals, setTokenDecimals] = useState('18');
  const [initialSupply, setInitialSupply] = useState('1000000');
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deployResult, setDeployResult] = useState<{
    contractAddress: string;
    txHash: string;
  } | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setProgress(1);
    setDeployResult(null);

    try {
      const result = await deploy({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: parseInt(tokenDecimals),
        initialSupply: parseWholeUnits(initialSupply),
        onProgress: (step) => setProgress(step),
      });

      setDeployResult({
        contractAddress: result.contractAddress,
        txHash: result.txHash,
      });

      // @ts-ignore: Skip type checking for contract address
      setERC20(
        result.contractAddress,
        tokenSymbol,
        tokenName,
        parseInt(tokenDecimals),
      );

      addTxRecord({
        type: 'deploy',
        description: 'ERC20 合约部署',
        hash: result.txHash,
        amount: initialSupply,
        direction: 'out',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Deploy failed:', error);
    } finally {
      setDeploying(false);
    }
  };

  const code = generateERC20SolidityHTML({
    name: tokenName,
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    supply: initialSupply,
  });

  const steps = [
    { id: 1, label: '编译', status: progress >= 1 ? 'done' as const : 'pending' as const },
    { id: 2, label: '签名', status: progress === 2 ? 'active' as const : progress > 2 ? 'done' as const : 'pending' as const },
    { id: 3, label: '确认', status: progress === 3 ? 'active' as const : progress > 3 ? 'done' as const : 'pending' as const },
    { id: 4, label: '成功', status: progress === 4 ? 'active' as const : 'pending' as const },
  ];

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">代币名称</label>
          <input 
            type="text" 
            className="form-input" 
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            disabled={deploying}
          />
        </div>
        <div className="form-group">
          <label className="form-label">代币符号</label>
          <input 
            type="text" 
            className="form-input" 
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            disabled={deploying}
          />
        </div>
        <div className="form-group">
          <label className="form-label">小数位数</label>
          <input 
            type="number" 
            className="form-input" 
            value={tokenDecimals}
            onChange={(e) => setTokenDecimals(e.target.value)}
            disabled={deploying}
            min="0"
            max="18"
            readOnly
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">初始供应量</label>
        <input 
          type="number" 
          className="form-input" 
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
          disabled={deploying}
          min="0"
          step="1"
        />
      </div>

      {deploying && (
        <div className="mb-4">
          <ProgressSteps steps={steps} />
        </div>
      )}

      <div className="flex justify-center mb-5">
        <button 
          className="btn btn-primary full-width" 
          onClick={handleDeploy}
          disabled={!isConnected || deploying}
          style={{ maxWidth: '400px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22V15.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 8.5L12 15.5L2 8.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 15.5L12 8.5L22 15.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V8.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {deploying ? '部署中...' : '部署到 Polkadot Hub'}
        </button>
      </div>

      {deployResult && (
        <div className="address-box border-[var(--success)] border-opacity-30">
          <div>
            <p className="text-xs text-[var(--success)] font-bold mb-2">✅ 部署成功</p>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-[var(--text-secondary)]">合约地址</span>
              <button
                onClick={() => navigator.clipboard.writeText(deployResult.contractAddress)}
                className="font-mono text-xs text-[var(--success)] hover:opacity-70 transition-opacity"
                title="点击复制"
              >
                {deployResult.contractAddress.slice(0, 10)}...{deployResult.contractAddress.slice(-6)} 📋
              </button>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-[var(--text-secondary)]">Blockscout</span>
              <a
                href={`https://blockscout-testnet.polkadot.io/tx/${deployResult.txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--polkadot-primary-light)] hover:underline"
              >
                查看交易 ↗
              </a>
            </div>
          </div>
        </div>
      )}

      <CodeViewer code={code} filename={`${tokenSymbol || 'MTT'}.sol`} />
    </div>
  );
};
