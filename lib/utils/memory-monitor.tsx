'use client';

import React, { useEffect, useState } from 'react';
import { 
  takeMemorySnapshot, 
  formatBytes, 
  calculateMemoryGrowthRate,
  detectMemoryLeak
} from './memory-profiler';

interface MemoryMonitorProps {
  intervalMs?: number;
  showAlways?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * A component that displays memory usage information in development mode
 * This is only rendered in development mode and helps identify memory leaks
 */
const MemoryMonitor: React.FC<MemoryMonitorProps> = ({
  intervalMs = 2000,
  showAlways = false,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const [memoryInfo, setMemoryInfo] = useState<{
    used: string;
    total: string;
    limit: string;
    growthRate: string | null;
    isLeaking: boolean;
  }>({
    used: 'N/A',
    total: 'N/A',
    limit: 'N/A',
    growthRate: null,
    isLeaking: false
  });

  useEffect(() => {
    // Toggle visibility with keyboard shortcut (Alt+M)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Set up memory monitoring
    const intervalId = setInterval(() => {
      if (!isVisible && !showAlways) return;

      const snapshot = takeMemorySnapshot();
      if (snapshot) {
        const leakCheck = detectMemoryLeak();
        
        setMemoryInfo({
          used: formatBytes(snapshot.usedJSHeapSize),
          total: formatBytes(snapshot.totalJSHeapSize),
          limit: formatBytes(snapshot.jsHeapSizeLimit),
          growthRate: leakCheck.growthRateFormatted,
          isLeaking: leakCheck.isLeaking
        });
      }
    }, intervalMs);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, [intervalMs, isVisible, showAlways]);

  if (!isVisible) return null;

  // Determine position styles
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    maxWidth: '200px',
    ...(position === 'top-right' ? { top: '10px', right: '10px' } :
        position === 'top-left' ? { top: '10px', left: '10px' } :
        position === 'bottom-left' ? { bottom: '10px', left: '10px' } :
        { bottom: '10px', right: '10px' })
  };

  return (
    <div style={positionStyles}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Memory Monitor</div>
      <div>Used: {memoryInfo.used}</div>
      <div>Total: {memoryInfo.total}</div>
      <div>Limit: {memoryInfo.limit}</div>
      {memoryInfo.growthRate && (
        <div style={{ 
          color: memoryInfo.isLeaking ? '#ff4d4d' : 'inherit',
          fontWeight: memoryInfo.isLeaking ? 'bold' : 'normal'
        }}>
          Growth: {memoryInfo.growthRate}
          {memoryInfo.isLeaking && ' ⚠️'}
        </div>
      )}
      <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}>
        Press Alt+M to toggle
      </div>
    </div>
  );
};

export default MemoryMonitor;
