'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  onAlert, 
  getActiveAlerts, 
  getAlertHistory, 
  acknowledgeAlert,
  clearAlert,
  clearAllAlerts,
  triggerAlert,
  checkAlert,
  Alert,
  AlertType,
  AlertSeverity
} from '@/lib/utils/alert-system';

/**
 * Hook for interacting with the alert system
 * @returns Object with alert system methods and state
 */
export function useAlertSystem() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  
  // Update alerts when they change
  useEffect(() => {
    // Initial state
    setActiveAlerts(getActiveAlerts());
    setAlertHistory(getAlertHistory());
    
    // Subscribe to new alerts
    const unsubscribe = onAlert(() => {
      setActiveAlerts(getActiveAlerts());
      setAlertHistory(getAlertHistory());
    });
    
    return unsubscribe;
  }, []);
  
  /**
   * Acknowledge an alert
   * @param alertId ID of the alert to acknowledge
   */
  const handleAcknowledge = useCallback((alertId: string) => {
    if (acknowledgeAlert(alertId)) {
      setActiveAlerts(getActiveAlerts());
    }
  }, []);
  
  /**
   * Clear an alert
   * @param alertId ID of the alert to clear
   */
  const handleClear = useCallback((alertId: string) => {
    if (clearAlert(alertId)) {
      setActiveAlerts(getActiveAlerts());
    }
  }, []);
  
  /**
   * Clear all active alerts
   */
  const handleClearAll = useCallback(() => {
    clearAllAlerts();
    setActiveAlerts(getActiveAlerts());
  }, []);
  
  /**
   * Trigger a custom alert
   * @param type Alert type
   * @param message Alert message
   * @param severity Alert severity
   * @param metadata Additional metadata
   */
  const handleTriggerAlert = useCallback((
    type: AlertType,
    message: string,
    severity: AlertSeverity = AlertSeverity.WARNING,
    metadata: Record<string, any> = {}
  ) => {
    triggerAlert(type, message, severity, metadata);
  }, []);
  
  /**
   * Check if a metric exceeds its alert threshold
   * @param type Alert type
   * @param value Current metric value
   * @param metadata Additional metadata
   */
  const handleCheckAlert = useCallback((
    type: AlertType,
    value: number,
    metadata: Record<string, any> = {}
  ) => {
    checkAlert(type, value, metadata);
  }, []);
  
  return {
    // State
    activeAlerts,
    alertHistory,
    hasActiveAlerts: activeAlerts.length > 0,
    
    // Critical alerts (error or critical severity)
    criticalAlerts: activeAlerts.filter(
      alert => alert.severity === AlertSeverity.ERROR || 
               alert.severity === AlertSeverity.CRITICAL
    ),
    hasCriticalAlerts: activeAlerts.some(
      alert => alert.severity === AlertSeverity.ERROR || 
               alert.severity === AlertSeverity.CRITICAL
    ),
    
    // Actions
    acknowledgeAlert: handleAcknowledge,
    clearAlert: handleClear,
    clearAllAlerts: handleClearAll,
    triggerAlert: handleTriggerAlert,
    checkAlert: handleCheckAlert,
    
    // Constants
    AlertType,
    AlertSeverity,
  };
}

export default useAlertSystem;
