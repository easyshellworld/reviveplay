import React, { useState } from 'react';

interface CodeViewerProps {
  code: string;
  filename?: string;
  rawCode?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ 
  code, 
  filename = 'contract.sol',
  rawCode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = rawCode || code.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="flex items-center gap-2">
          {/* macOS dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 code-filename">{filename}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="code-version">Solidity 0.8.28</span>
          <button
            onClick={handleCopy}
            style={{
              fontSize: 11,
              color: copied ? 'var(--success)' : 'var(--text-secondary)',
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: 4,
              padding: '2px 8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ 已复制' : '复制'}
          </button>
        </div>
      </div>
      <div className="code-content">
        <pre style={{ margin: 0 }}>
          <code dangerouslySetInnerHTML={{ __html: code }} />
        </pre>
      </div>
    </div>
  );
};
