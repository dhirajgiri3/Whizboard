'use client';

import React, { useState, useEffect } from 'react';
import { useAlertSystem } from '@/hooks';
import { AlertSeverity } from '@/lib/utils/alert-system';

interface AlertDashboardProps {
  showAlways?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * A component that displays a dashboard of alerts
 * This is only rendered in development mode by default
 */
const AlertDashboard: React.FC<AlertDashboardProps> = ({
  showAlways = false,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const { activeAlerts, alertHistory, acknowledgeAlert, clearAlert, clearAllAlerts } = useAlertSystem();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    // Toggle visibility with keyboard shortcut (Alt+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible && !showAlways) return null;
  if (process.env.NODE_ENV !== 'development' && !showAlways) return null;

  // Determine position styles
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9996, // Lower than other monitors
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    maxWidth: '400px',
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

  // Get color for alert severity
  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.INFO: return '#2196F3';
      case AlertSeverity.WARNING: return '#FF9800';
      case AlertSeverity.ERROR: return '#F44336';
      case AlertSeverity.CRITICAL: return '#9C27B0';
      default: return '#757575';
    }
  };

  // Get icon for alert severity
  const getSeverityIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.INFO: return 'ℹ️';
      case AlertSeverity.WARNING: return '⚠️';
      case AlertSeverity.ERROR: return '❌';
      case AlertSeverity.CRITICAL: return '🚨';
      default: return '⚠️';
    }
  };

  const renderAlertItem = (alert: any, isActive: boolean) => (
    <div 
      key={alert.id}
      style={{
        marginBottom: '8px',
        padding: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
        borderRadius: '2px',
        opacity: alert.acknowledged ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <span style={{ marginRight: '4px' }}>{getSeverityIcon(alert.severity)}</span>
          <span style={{ fontWeight: 'bold' }}>{alert.name}</span>
        </div>
        
        {isActive && (
          <div>
            {!alert.acknowledged && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  marginRight: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  padding: '2px 4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                }}
              >
                ACK
              </button>
            )}
            <button
              onClick={() => clearAlert(alert.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px',
                padding: '2px 4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
              }}
            >
              CLEAR
            </button>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '4px' }}>{alert.message}</div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '10px',
        opacity: 0.8,
      }}>
        <span>
          {new Date(alert.timestamp).toLocaleString()}
        </span>
        
        {alert.value > 0 && (
          <span>
            {alert.value.toFixed(2)} / {alert.threshold.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );

  const renderActiveAlerts = () => (
    <div>
      {activeAlerts.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>
          No active alerts
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>Active Alerts: {activeAlerts.length}</div>
            <button
              onClick={clearAllAlerts}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0',
                fontSize: '12px',
              }}
            >
              Clear All
            </button>
          </div>
          {activeAlerts.map(alert => renderAlertItem(alert, true))}
        </>
      )}
    </div>
  );

  const renderAlertHistory = () => (
    <div>
      {alertHistory.length === 0 ? (
        <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>
          No alert history
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '8px' }}>
            Alert History: {alertHistory.length}
          </div>
          {alertHistory.map(alert => renderAlertItem(alert, false))}
        </>
      )}
    </div>
  );

  return (
    <div style={positionStyles}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px' }}>
        Alert Dashboard
      </div>
      
      <div>
        <div 
          style={activeTab === 'active' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeAlerts.length})
        </div>
        <div 
          style={activeTab === 'history' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('history')}
        >
          History ({alertHistory.length})
        </div>
      </div>
      
      {activeTab === 'active' && renderActiveAlerts()}
      {activeTab === 'history' && renderAlertHistory()}
      
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '4px' }}>
        Press Alt+A to toggle
      </div>
    </div>
  );
};

export default AlertDashboard;
