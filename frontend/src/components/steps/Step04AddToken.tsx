import React from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/store/appStore';
import { useAddToken } from '@/hooks/useAddToken';
import { useTokenBalance } from '@/hooks/useTokenBalance';

export const Step04AddToken: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { erc20Address, erc20Name, erc20Symbol, erc20Decimals } = useAppStore();
  const { addERC20 } = useAddToken();
  const { balance } = useTokenBalance({
    tokenAddress: erc20Address as `0x${string}`,
    accountAddress: address,
  });

  const handleAddToWallet = async () => {
    if (!erc20Address) return;
    await addERC20({
      address: erc20Address as any,
      symbol: erc20Symbol,
      decimals: erc20Decimals,
    });
  };

  return (
    <div>
      {erc20Address ? (
        <div>
          <div className="content-block">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--polkadot-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>
                  {erc20Symbol?.[0] || 'T'}
                </div>
                <div>
                  <div style={{fontWeight: 600, fontSize: 16, color: 'var(--text-primary)'}}>{erc20Name}</div>
                  <div style={{color: 'var(--text-secondary)', fontSize: 13}}>{erc20Symbol}</div>
                </div>
              </div>
              <div className="balance-value">
                <span className="balance-amount">
                  {balance !== undefined ? (Number(balance) / 10 ** erc20Decimals).toLocaleString() : '—'}
                </span>
                <span className="balance-unit">{erc20Symbol}</span>
              </div>
            </div>

            <div>
              <div className="address-label">合约地址</div>
              <div className="address-box">
                <div>
                  <div className="address-value">{erc20Address}</div>
                </div>
                <button 
                  className="btn-copy"
                  onClick={() => navigator.clipboard.writeText(erc20Address || '')}
                >
                  复制
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">小数位数</label>
              <input 
                type="number" 
                className="form-input" 
                value={erc20Decimals}
                readOnly
              />
            </div>

            <button 
              className="btn-metamask mt-4"
              onClick={handleAddToWallet}
              disabled={!isConnected}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L4.5 17.5L12 22L19.5 17.5L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 11.5L10 17.5L12 12L14 17.5L16.5 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              添加到 MetaMask
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="var(--text-disabled)" strokeWidth="2"/>
            <path d="M12 8v8M8 12h8" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h4>请先部署 ERC20 合约</h4>
          <p>完成第三步部署后，您可以将代币添加到钱包中</p>
        </div>
      )}
    </div>
  );
};
