import React from 'react';

export default function SkeletonLoader({ className = '', width = '100%', height = '20px', borderRadius = '8px' }) {
  return (
    <div 
      className={`animate-pulse bg-surface-variant ${className}`}
      style={{ width, height, borderRadius }}
    ></div>
  );
}
