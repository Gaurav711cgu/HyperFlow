import React from 'react';

/**
 * Signature HyperFlow 4.0 SVG animated confidence arc gauge
 */
export default function ConfidenceArc({ confidence = 0.85, label = "Confidence", color = "#00D4AA", size = 110 }) {
  const normalizedConfidence = Math.min(1.0, Math.max(0.0, confidence));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalizedConfidence);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Outer subtle glow track */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="none" 
          stroke="rgba(255,255,255,0.06)" 
          strokeWidth="7" 
        />
        {/* Animated Confidence Arc */}
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="none" 
          stroke={color} 
          strokeWidth="7" 
          strokeDasharray={circumference} 
          strokeDashoffset={dashOffset} 
          strokeLinecap="round" 
          transform="rotate(-90 50 50)" 
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }} 
        />
        {/* Center Percentage */}
        <text 
          x="50" 
          y="46" 
          textAnchor="middle" 
          fill="#FFFFFF" 
          fontSize="17" 
          fontWeight="bold"
          fontFamily="JetBrains Mono, monospace"
        >
          {Math.round(normalizedConfidence * 100)}%
        </text>
        {/* Label */}
        <text 
          x="50" 
          y="62" 
          textAnchor="middle" 
          fill="#8888A8" 
          fontSize="9" 
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
