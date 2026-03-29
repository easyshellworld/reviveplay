import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/shared/Toast';
import { ConnectBanner } from '@/components/layout/ConnectBanner';
import { Step01Connect } from '@/components/steps/Step01Connect';
import { Step02Faucet } from '@/components/steps/Step02Faucet';
import { Step03DeployERC20 } from '@/components/steps/Step03DeployERC20';
import { Step04AddToken } from '@/components/steps/Step04AddToken';
import { Step05Swap } from '@/components/steps/Step05Swap';
import { Step06MintNFT } from '@/components/steps/Step06MintNFT';
import { wagmiConfig } from '@/lib/wagmi';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ProgressSteps } from '@/components/shared/ProgressSteps';

// Removed unused Header import - layout simplified according to yangshi.html

const queryClient = new QueryClient();

import { Header } from '@/components/layout/Header';

function AppContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const { isConnected } = useAccount();

  // For testing, always show the connect banner
  const showConnectBanner = !isConnected;

  // Auto-step to 2 only if connected and still on step 1
  useEffect(() => {
    if (isConnected) {
      if (currentStep === 1) setCurrentStep(2);
    } else {
      // If disconnected, go back to step 1
      if (currentStep > 1) setCurrentStep(1);
    }
  }, [isConnected, currentStep]);

  const totalSteps = 6;
  
  const steps = [
    { id: 1, label: '连接', status: currentStep === 1 ? 'active' : (currentStep > 1 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
    { id: 2, label: '领水', status: currentStep === 2 ? 'active' : (currentStep > 2 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
    { id: 3, label: '部署', status: currentStep === 3 ? 'active' : (currentStep > 3 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
    { id: 4, label: '添加', status: currentStep === 4 ? 'active' : (currentStep > 4 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
    { id: 5, label: 'Swap', status: currentStep === 5 ? 'active' : (currentStep > 5 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
    { id: 6, label: 'NFT', status: currentStep === 6 ? 'active' : (currentStep > 6 ? 'done' : 'pending') as 'pending' | 'active' | 'done' },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

// renderStep function removed - layout changed to per-step card design matching yangshi.html

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <div className="max-w-[1100px] mx-auto px-5 py-10">
         {/* Page Title */}
        <div className="mb-12">
          <p className="text-[var(--text-secondary)] text-[16px]">跟随以下步骤完成完整的 Web3 学习体验</p>
        </div>

        {/* Progress Steps */}
        <ProgressSteps steps={steps} className="mb-10" />

        {/* Step Content */}
        {steps.map((stepData) => {
          const isActive = stepData.id === currentStep;
          return (
            <div 
              key={stepData.id} 
              className={`${isActive ? 'block animate-[fadeIn_0.4s_ease]' : 'hidden'}`}
            >
              <div className="step-card bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--bg-card-border)] rounded-[var(--border-radius)] p-8 mb-6 shadow-lg transition-all hover:border-[rgba(230,0,122,0.4)] hover:shadow-xl">
                {(() => {
                  switch (stepData.id) {
                    case 1:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 01</span>
                            <h2 className="text-[22px] font-bold mb-1">连接钱包 & 网络配置</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">连接 MetaMask 钱包并配置 Polkadot Hub TestNet 网络</p>
                          </div>
                          {showConnectBanner && <ConnectBanner />}
                          <Step01Connect />
                        </>
                      );
                    case 2:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 02</span>
                            <h2 className="text-[22px] font-bold mb-1">领取测试代币</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">从官方水龙头获取 PAS 测试币，用于后续操作</p>
                          </div>
                          <Step02Faucet />
                        </>
                      );
                    case 3:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 03</span>
                            <h2 className="text-[22px] font-bold mb-1">部署 ERC20 代币</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">创建自定义代币合约，设置名称、符号和供应量</p>
                          </div>
                          <Step03DeployERC20 />
                        </>
                      );
                    case 4:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 04</span>
                            <h2 className="text-[22px] font-bold mb-1">添加代币到钱包</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">将部署的代币添加到 MetaMask 钱包，方便查看和管理</p>
                          </div>
                          <Step04AddToken />
                        </>
                      );
                    case 5:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 05</span>
                            <h2 className="text-[22px] font-bold mb-1">Swap 演示</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">使用固定汇率进行代币交换，学习 Swap 交互流程</p>
                          </div>
                          <Step05Swap />
                        </>
                      );
                    case 6:
                      return (
                        <>
                          <div className="mb-6">
                            <span className="inline-block bg-[var(--polkadot-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-sm mb-2 tracking-[0.5px]">STEP 06</span>
                            <h2 className="text-[22px] font-bold mb-1">Mint 纪念 NFT</h2>
                            <p className="text-[var(--text-secondary)] text-[15px]">铸造一个纪念 NFT，记录你在 Polkadot Hub 上的学习历程</p>
                          </div>
                          <Step06MintNFT />
                        </>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
          );
        })}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minWidth: '110px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            上一步
          </button>
          
          <button
            onClick={() => setCurrentStep(1)}
            className="btn btn-ghost"
            style={{ minWidth: '90px' }}
          >
            重置进度
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{ minWidth: '110px' }}
            >
              下一步
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
              style={{ minWidth: '110px' }}
            >
              完成教程
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;