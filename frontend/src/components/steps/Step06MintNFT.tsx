import React, { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { NFTCard } from '@/components/shared/NFTCard';
import { useMintNFT } from '@/hooks/useMintNFT';
import { useAppStore } from '@/store/appStore';
import { useAddToken } from '@/hooks/useAddToken';
import { PLAYGROUND_NFT_ABI } from '@/lib/contracts/abis';
import {
  PLAYGROUND_NFT_ADDRESS,
  isConfiguredContractAddress,
} from '@/lib/contracts/addresses';

// Polkadot Hub TestNet Blockscout URL
const BLOCKSCOUT_TX_URL = 'https://blockscout-testnet.polkadot.io/tx/';

export const Step06MintNFT: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { addTxRecord, setMintedNFT, mintedNFT } = useAppStore();
  const { mintNFT } = useMintNFT();
  const { addERC721 } = useAddToken();

  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  // 默认占位图：One Block Academy logo
  const [imageUrl, setImageUrl] = useState('https://oneblock-academy.netlify.app/logo.png');
  const [minting, setMinting] = useState(false);
  const isNftConfigured = isConfiguredContractAddress(PLAYGROUND_NFT_ADDRESS);

  const { data: nextTokenId } = useReadContract({
    address: PLAYGROUND_NFT_ADDRESS,
    abi: PLAYGROUND_NFT_ABI,
    functionName: 'nextTokenId',
    query: {
      enabled: isNftConfigured,
      refetchInterval: 5_000,
    },
  });

  const { data: totalMinted } = useReadContract({
    address: PLAYGROUND_NFT_ADDRESS,
    abi: PLAYGROUND_NFT_ABI,
    functionName: 'totalMinted',
    query: {
      enabled: isNftConfigured,
      refetchInterval: 5_000,
    },
  });

  const handleMint = async () => {
    if (!address || !isNftConfigured || !nextTokenId) return;

    setMinting(true);
    try {
      const previewTokenId = Number(nextTokenId);

      const { hash, mintedTokenId } = await mintNFT({
        nftName,
        description,
        imageUrl,
        ownerAddress: address,
        nextTokenId: previewTokenId,
      });

      setMintedNFT({
        tokenId: mintedTokenId,
        name: nftName || `Polkadot Revive Graduate #${mintedTokenId}`,
        description,
        image: imageUrl,
        txHash: hash,
      });

      addTxRecord({
        type: 'mint',
        description: 'NFT 铸造',
        hash,
        amount: '1',
        direction: 'in',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Mint failed:', error);
    } finally {
      setMinting(false);
    }
  };

  const handleAddNFTToWallet = async () => {
    if (!PLAYGROUND_NFT_ADDRESS) return;
    await addERC721({
      address: PLAYGROUND_NFT_ADDRESS,
      tokenId: '0',
    });
  };

  if (!isNftConfigured) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="var(--text-disabled)" strokeWidth="2"/>
          <path d="M12 6v6M12 18h.01" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h4>NFT 合约尚未配置</h4>
        <p>请在项目根目录的 <code>.env</code> 中设置 <br/> <code>VITE_PLAYGROUND_NFT_ADDRESS</code>。</p>
      </div>
    );
  }

  const previewTokenId = Number(nextTokenId ?? 1n);

  return (
    <div>
      <div className="content-block">
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="flex-1 space-y-4">
            <div className="callout callout-pink">
              <span className="callout-icon">💡</span>
              <p>
                Mint 一个纪念 NFT，记录您完成 Polkadot Revive Playground 的里程碑。
                NFT metadata 直接存储在链上，永久保存。
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">NFT 名称</label>
              <input 
                type="text" 
                className="form-input" 
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="我的结业证书"
                disabled={minting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">描述</label>
              <input 
                type="text" 
                className="form-input" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="完成 Polkadot Revive Playground 教学课程"
                disabled={minting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">头像 URL</label>
              <input 
                type="text" 
                className="form-input" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={minting}
              />
            </div>

            <div className="flex flex-col gap-0 max-w-xs mx-auto">
              <button 
                className="btn btn-primary w-full"
                onClick={handleMint}
                disabled={!isConnected || minting}
              >
                {minting ? 'Minting...' : '🎁 Mint NFT'}
              </button>

              {PLAYGROUND_NFT_ADDRESS !== '0x0000000000000000000000000000000000000000' && (
                <button 
                  className="btn btn-metamask mt-4 w-full"
                  onClick={handleAddNFTToWallet}
                  disabled={!isConnected}
                >
                🦊 添加 NFT 到 MetaMask
              </button>
            )}
            </div>
           </div>

           <div className="flex-1 space-y-4">
             <div className="content-block">
               <h4 className="text-lg font-bold mb-3">NFT 预览</h4>
               <NFTCard
                 metadata={{
                   name: nftName || `Graduate #${previewTokenId}`,
                   description,
                   image: imageUrl,
                   attributes: [
                     { trait_type: 'Graduation', value: 'Polkadot Revive Playground' },
                     { trait_type: 'Chain', value: 'Polkadot Hub TestNet' },
                     { trait_type: 'Date', value: new Date().toLocaleDateString() },
                   ]
                 }}
                 tokenId={previewTokenId}
                 isPreview={true}
               />
               
               {/* 交易查询链接 - 只在mint成功后显示 */}
               {mintedNFT && (
                 <div className="mt-4 pt-4 border-t border-[var(--border)]">
                   <a 
                     href={`${BLOCKSCOUT_TX_URL}${mintedNFT.txHash}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--polkadot-primary)] bg-[var(--dot-pink-dim)] text-[var(--polkadot-primary)] hover:bg-[var(--dot-pink)] hover:text-white transition-all"
                   >
                     <span>🔗</span>
                     <span className="font-medium">查看交易 on Blockscout</span>
                   </a>
                 </div>
               )}
             </div>

             <div className="content-block">
               <h4 className="text-lg font-bold text-[var(--text-primary)] mb-3">铸造统计</h4>
               <div className="space-y-3">
                 <div className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                   <span className="text-sm text-[var(--text-secondary)]">当前 Token ID</span>
                   <span className="font-mono text-sm text-[var(--text-primary)] font-bold">
                     {String(nextTokenId ?? 0n)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                   <span className="text-sm text-[var(--text-secondary)]">已铸造总数</span>
                   <span className="font-mono text-sm text-[var(--success)] font-bold">
                     {String(totalMinted ?? 0n)}
                   </span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
