'use client';

import React, { useState, useEffect } from 'react';
import { getConnectionQuality, updateConnectionQuality } from '@/lib/apollo/client';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionQualityMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showAlways?: boolean;
}

const ConnectionQualityMonitor: React.FC<ConnectionQualityMonitorProps> = ({
  position = 'top-right',
  showAlways = false
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const [connectionQuality, setConnectionQuality] = useState(getConnectionQuality());

  useEffect(() => {
    // Toggle visibility with keyboard shortcut (Alt+Q)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'q') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Update connection quality every 5 seconds
    const interval = setInterval(() => {
      setConnectionQuality(getConnectionQuality());
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  const getQualityIcon = () => {
    switch (connectionQuality.quality) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case 'fair':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getQualityColor = () => {
    switch (connectionQuality.quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    maxWidth: '200px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    ...(position === 'top-right' ? { top: '10px', right: '10px' } :
        position === 'top-left' ? { top: '10px', left: '10px' } :
        position === 'bottom-left' ? { bottom: '10px', left: '10px' } :
        { bottom: '10px', right: '10px' })
  };

  return (
    <div style={positionStyles}>
      <div className="flex items-center gap-2 mb-2">
        {getQualityIcon()}
        <span className={`font-bold ${getQualityColor()}`}>
          Connection Quality
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Quality:</span>
          <span className={`font-semibold ${getQualityColor()}`}>
            {connectionQuality.quality.toUpperCase()}
          </span>
        </div>
        
        {connectionQuality.latency > 0 && (
          <div className="flex justify-between">
            <span>Latency:</span>
            <span>{connectionQuality.latency}ms</span>
          </div>
        )}
        
        {connectionQuality.packetLoss > 0 && (
          <div className="flex justify-between">
            <span>Packet Loss:</span>
            <span>{connectionQuality.packetLoss}%</span>
          </div>
        )}
        
        {connectionQuality.jitter > 0 && (
          <div className="flex justify-between">
            <span>Jitter:</span>
            <span>{connectionQuality.jitter}ms</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Press Alt+Q to toggle
      </div>
    </div>
  );
};

export default ConnectionQualityMonitor;
