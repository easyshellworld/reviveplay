import React from 'react';

interface NFTCardProps {
  metadata: Record<string, unknown> | null;
  tokenId: number;
  isPreview?: boolean;
  className?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({ 
  metadata, 
  tokenId, 
  isPreview = false, 
  className = '' 
}) => {
  if (!metadata) {
    return (
      <div className={`card text-center ${className}`}>
        <p className="text-[var(--text-muted)]">Invalid metadata</p>
      </div>
    );
  }

  const name = typeof metadata.name === 'string' ? metadata.name : `Graduate #${tokenId}`;
  const image = typeof metadata.image === 'string' ? metadata.image : '';
  const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

  return (
    <div className={`card ${className}`} style={{
      background: 'linear-gradient(135deg, var(--bg-card), rgba(109,58,238,0.08))',
      borderColor: !isPreview ? 'rgba(0,255,163,0.3)' : 'var(--border)',
    }}>
      <div className="h-0.5 -mx-6 -mt-6 mb-6 rounded-t-2xl"
           style={{ background: 'linear-gradient(90deg, var(--dot-pink), var(--dot-purple))' }} />
      
       <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[var(--dot-pink)]"
            style={{ boxShadow: '0 0 24px var(--dot-pink-glow)' }}>
        {image
          ? <img src={image} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[var(--dot-pink)] to-[var(--dot-purple)]
                          flex items-center justify-center text-white text-4xl select-none">
              🎓
            </div>
        }
      </div>
      
      <h3 className="text-center font-bold text-lg text-[var(--text-primary)] mb-2 font-[var(--font-display)]">
        {name}
      </h3>
      
      <div className="flex justify-center gap-2 mb-4">
        <span className="tag testnet">Polkadot Revive Graduate</span>
        {isPreview && (
          <span className="tag"
                style={{ background: 'rgba(109,58,238,0.15)', color: '#A78BFA', border: '1px solid rgba(109,58,238,0.3)' }}>
            Preview
          </span>
        )}
      </div>
      
      {attributes.slice(0, 5).map((attr: any, i: number) => (
        <div key={i} className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0 text-xs">
          <span className="text-[var(--text-secondary)]">{attr.trait_type}</span>
          <span className="font-mono text-[var(--text-primary)] truncate max-w-[60%] text-right">
            {String(attr.value)}
          </span>
        </div>
      ))}
    </div>
  );
};
