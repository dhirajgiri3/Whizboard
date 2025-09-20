'use client';

import React, { useState, useEffect } from 'react';
import { useAlertSystem } from '@/hooks';
import { AlertSeverity, Alert } from '@/lib/utils/alert-system';

interface AlertNotificationsProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxAlerts?: number;
  autoHideSeconds?: number;
}

/**
 * A component that displays alert notifications
 */
const AlertNotifications: React.FC<AlertNotificationsProps> = ({
  position = 'top-right',
  maxAlerts = 3,
  autoHideSeconds = 0, // 0 means no auto-hide
}) => {
  const { activeAlerts, acknowledgeAlert, clearAlert } = useAlertSystem();
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  
  // Update visible alerts when active alerts change
  useEffect(() => {
    setVisibleAlerts(activeAlerts.slice(0, maxAlerts));
  }, [activeAlerts, maxAlerts]);
  
  // Auto-hide alerts after a delay if specified
  useEffect(() => {
    if (autoHideSeconds <= 0) return;
    
    const timeouts: NodeJS.Timeout[] = [];
    
    visibleAlerts.forEach(alert => {
      if (!alert.acknowledged) {
        const timeout = setTimeout(() => {
          acknowledgeAlert(alert.id);
        }, autoHideSeconds * 1000);
        
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [visibleAlerts, acknowledgeAlert, autoHideSeconds]);
  
  // If no visible alerts, don't render anything
  if (visibleAlerts.length === 0) return null;
  
  // Determine position styles
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '400px',
    ...(position === 'top-right' ? { top: '20px', right: '20px' } :
        position === 'top-left' ? { top: '20px', left: '20px' } :
        position === 'bottom-left' ? { bottom: '20px', left: '20px' } :
        { bottom: '20px', right: '20px' })
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
  
  return (
    <div style={containerStyles}>
      {visibleAlerts.map(alert => (
        <div 
          key={alert.id}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
            borderRadius: '4px',
            padding: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            opacity: alert.acknowledged ? 0.7 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ marginRight: '8px' }}>{getSeverityIcon(alert.severity)}</span>
            <span style={{ fontWeight: 'bold' }}>{alert.name}</span>
            <button
              onClick={() => clearAlert(alert.id)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '8px' }}>{alert.message}</div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            opacity: 0.8,
          }}>
            <span>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
            
            {!alert.acknowledged && (
              <button
                onClick={() => acknowledgeAlert(alert.id)}
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
                Acknowledge
              </button>
            )}
          </div>
        </div>
      ))}
      
      {activeAlerts.length > maxAlerts && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          borderRadius: '4px',
          padding: '4px',
        }}>
          +{activeAlerts.length - maxAlerts} more alerts
        </div>
      )}
    </div>
  );
};

export default AlertNotifications;
