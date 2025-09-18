'use client';

import React, { useState, useEffect } from 'react';
import { MetricType, getMetrics, getAverageMetric, initWebVitals } from '@/lib/utils/performance-metrics';

interface PerformanceDashboardProps {
  showAlways?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * A component that displays performance metrics in development mode
 * This is only rendered in development mode by default
 */
const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  showAlways = false,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const [metrics, setMetrics] = useState<Record<string, number | null>>({});
  const [activeTab, setActiveTab] = useState<'webVitals' | 'custom' | 'board'>('webVitals');

  useEffect(() => {
    // Initialize web vitals monitoring
    initWebVitals();
    
    // Toggle visibility with keyboard shortcut (Alt+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'p') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Update metrics periodically
    const intervalId = setInterval(() => {
      if (!isVisible && !showAlways) return;
      
      const updatedMetrics: Record<string, number | null> = {};
      
      // Web Vitals
      updatedMetrics[MetricType.FCP] = getAverageMetric(MetricType.FCP);
      updatedMetrics[MetricType.LCP] = getAverageMetric(MetricType.LCP);
      updatedMetrics[MetricType.FID] = getAverageMetric(MetricType.FID);
      updatedMetrics[MetricType.CLS] = getAverageMetric(MetricType.CLS);
      updatedMetrics[MetricType.TTFB] = getAverageMetric(MetricType.TTFB);
      
      // Custom metrics
      updatedMetrics[MetricType.BOARD_LOAD] = getAverageMetric(MetricType.BOARD_LOAD);
      updatedMetrics[MetricType.BOARD_RENDER] = getAverageMetric(MetricType.BOARD_RENDER);
      updatedMetrics[MetricType.ELEMENT_RENDER] = getAverageMetric(MetricType.ELEMENT_RENDER);
      updatedMetrics[MetricType.COLLABORATION_LATENCY] = getAverageMetric(MetricType.COLLABORATION_LATENCY);
      updatedMetrics[MetricType.API_RESPONSE] = getAverageMetric(MetricType.API_RESPONSE);
      
      // Get all metrics to find custom ones
      const allMetricTypes = new Set<string>();
      Object.keys(MetricType).forEach(key => {
        const metricType = MetricType[key as keyof typeof MetricType];
        allMetricTypes.add(metricType);
      });
      
      // Add any custom metrics not covered by the enum
      const customMetrics = Object.keys(getMetrics('*')).filter(
        type => !allMetricTypes.has(type)
      );
      
      customMetrics.forEach(metricType => {
        updatedMetrics[metricType] = getAverageMetric(metricType);
      });
      
      setMetrics(updatedMetrics);
    }, 2000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, [isVisible, showAlways]);

  if (!isVisible && !showAlways) return null;
  if (process.env.NODE_ENV !== 'development' && !showAlways) return null;

  // Determine position styles
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9998, // Lower than memory monitor
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    maxWidth: '300px',
    maxHeight: '400px',
    overflow: 'auto',
    ...(position === 'top-right' ? { top: '10px', right: '10px' } :
        position === 'top-left' ? { top: '10px', left: '10px' } :
        position === 'bottom-left' ? { bottom: '10px', left: '10px' } :
        { bottom: '10px', right: '10px' })
  };

  const tabStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    marginRight: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  };

  const getMetricColor = (value: number | null, thresholds: [number, number]): string => {
    if (value === null) return 'inherit';
    const [warning, critical] = thresholds;
    return value > critical ? '#ff4d4d' : value > warning ? '#ffcc00' : '#4caf50';
  };

  const renderMetricRow = (name: string, value: number | null, thresholds: [number, number] = [1000, 3000]) => {
    if (value === null) return null;
    
    return (
      <div key={name} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
        <span>{name}:</span>
        <span style={{ color: getMetricColor(value, thresholds) }}>
          {value.toFixed(2)}ms
        </span>
      </div>
    );
  };

  const renderWebVitals = () => (
    <div>
      {renderMetricRow('FCP', metrics[MetricType.FCP], [1000, 3000])}
      {renderMetricRow('LCP', metrics[MetricType.LCP], [2500, 4000])}
      {renderMetricRow('FID', metrics[MetricType.FID], [100, 300])}
      {renderMetricRow('CLS', metrics[MetricType.CLS], [100, 250])}
      {renderMetricRow('TTFB', metrics[MetricType.TTFB], [500, 1500])}
    </div>
  );

  const renderBoardMetrics = () => (
    <div>
      {renderMetricRow('Board Load', metrics[MetricType.BOARD_LOAD], [1000, 3000])}
      {renderMetricRow('Board Render', metrics[MetricType.BOARD_RENDER], [500, 1500])}
      {renderMetricRow('Element Render', metrics[MetricType.ELEMENT_RENDER], [50, 200])}
      {renderMetricRow('Collab Latency', metrics[MetricType.COLLABORATION_LATENCY], [100, 500])}
      {renderMetricRow('API Response', metrics[MetricType.API_RESPONSE], [200, 1000])}
    </div>
  );

  const renderCustomMetrics = () => (
    <div>
      {Object.entries(metrics)
        .filter(([key]) => 
          !Object.values(MetricType).includes(key as MetricType) && 
          key !== 'undefined' &&
          metrics[key] !== null
        )
        .map(([key, value]) => renderMetricRow(key, value))}
    </div>
  );

  return (
    <div style={positionStyles}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px' }}>
        Performance Dashboard
      </div>
      
      <div>
        <div 
          style={activeTab === 'webVitals' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('webVitals')}
        >
          Web Vitals
        </div>
        <div 
          style={activeTab === 'board' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('board')}
        >
          Board
        </div>
        <div 
          style={activeTab === 'custom' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </div>
      </div>
      
      {activeTab === 'webVitals' && renderWebVitals()}
      {activeTab === 'board' && renderBoardMetrics()}
      {activeTab === 'custom' && renderCustomMetrics()}
      
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '4px' }}>
        Press Alt+P to toggle
      </div>
    </div>
  );
};

export default PerformanceDashboard;
