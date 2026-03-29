import React from 'react';

interface ProgressStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'done';
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, className = '' }) => {
  // Calculate SVG viewBox width based on number of steps
  const viewBoxWidth = 120 + (steps.length - 1) * 167;
  
  return (
    <div className={`step-progress ${className}`}>
      <svg viewBox={`0 0 ${viewBoxWidth} 80`} xmlns="http://www.w3.org/2000/svg" className="w-full h-[80px]">
        {/* Background line */}
        <line 
          x1="83" y1="20" x2={viewBoxWidth - 37} y2="20" 
          className="step-line stroke-[rgba(107,114,128,0.3)] stroke-wdith-2 stroke-linecap-round" 
        />
        
        {steps.map((step, index) => {
          const cx = 83 + index * 167;
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              {/* Completed line */}
              {!isLast && (
                <line 
                  x1="83" y1="20" x2={cx + 167} y2="20" 
                  className={`step-line ${step.status === 'done' ? 'stroke-[var(--success)]' : ''}`}
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              )}
              
              {/* Step circle */}
              <circle 
                cx={cx} cy="20" r="10" 
                className={`step-circle ${
                  step.status === 'done' 
                    ? 'stroke-[var(--success)] fill-[var(--success)] completed' 
                    : step.status === 'active' 
                    ? 'stroke-[var(--polkadot-primary)] fill-[var(--polkadot-primary)] active filter drop-shadow-[0_0_8px_rgba(230,0,122,0.6)]' 
                    : 'stroke-[var(--text-disabled)] pending'
                }`}
                strokeWidth="2" 
              />
              
              {/* Check mark for done */}
              {step.status === 'done' && (
                <path 
                  d={`${cx - 5} 20 L${cx - 1} 24 L${cx + 5} 18`} 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="step-check visible" 
                />
              )}
              
              {/* Step label */}
              <text 
                x={cx} y="50" 
                textAnchor="middle"
                className={`step-label text-[13px] font-medium ${
                  step.status === 'done' 
                    ? 'fill-[var(--success)] completed' 
                    : step.status === 'active' 
                    ? 'fill-[var(--polkadot-primary)] active' 
                    : 'fill-[var(--text-disabled)] pending'
                }`}
              >
                {step.label}
              </text>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};
