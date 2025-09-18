/**
 * Alert System Utility
 * 
 * This utility provides tools for monitoring critical metrics and triggering
 * alerts when thresholds are exceeded.
 */

// Types of alerts
export enum AlertType {
  ERROR_RATE = 'error_rate',
  MEMORY_LEAK = 'memory_leak',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  API_LATENCY = 'api_latency',
  CONNECTION_QUALITY = 'connection_quality',
  SERVER_ERROR = 'server_error',
  SECURITY_ISSUE = 'security_issue',
  CUSTOM = 'custom',
}

// Alert severity levels
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Interface for alert configuration
interface AlertConfig {
  type: AlertType;
  name: string;
  enabled: boolean;
  severity: AlertSeverity;
  threshold: number;
  cooldownMinutes: number;
  lastTriggered?: number;
}

// Interface for an alert instance
export interface Alert {
  id: string;
  type: AlertType;
  name: string;
  message: string;
  severity: AlertSeverity;
  timestamp: number;
  value: number;
  threshold: number;
  metadata?: Record<string, any>;
  acknowledged: boolean;
}

// Default alert configurations
const defaultAlertConfigs: AlertConfig[] = [
  {
    type: AlertType.ERROR_RATE,
    name: 'High Error Rate',
    enabled: true,
    severity: AlertSeverity.ERROR,
    threshold: 5, // Errors per minute
    cooldownMinutes: 5,
  },
  {
    type: AlertType.MEMORY_LEAK,
    name: 'Memory Leak Detected',
    enabled: true,
    severity: AlertSeverity.ERROR,
    threshold: 1000000, // Bytes per second growth
    cooldownMinutes: 10,
  },
  {
    type: AlertType.PERFORMANCE_DEGRADATION,
    name: 'Performance Degradation',
    enabled: true,
    severity: AlertSeverity.WARNING,
    threshold: 1000, // Milliseconds (LCP threshold)
    cooldownMinutes: 5,
  },
  {
    type: AlertType.API_LATENCY,
    name: 'High API Latency',
    enabled: true,
    severity: AlertSeverity.WARNING,
    threshold: 2000, // Milliseconds
    cooldownMinutes: 5,
  },
  {
    type: AlertType.CONNECTION_QUALITY,
    name: 'Poor Connection Quality',
    enabled: true,
    severity: AlertSeverity.WARNING,
    threshold: 500, // Milliseconds (latency)
    cooldownMinutes: 5,
  },
  {
    type: AlertType.SERVER_ERROR,
    name: 'Server Error Rate',
    enabled: true,
    severity: AlertSeverity.ERROR,
    threshold: 3, // Errors per minute
    cooldownMinutes: 5,
  },
];

// Store alert configurations
let alertConfigs: AlertConfig[] = [...defaultAlertConfigs];

// Store active alerts
const activeAlerts: Alert[] = [];

// Store alert history (limited to 100 most recent)
const alertHistory: Alert[] = [];
const MAX_ALERT_HISTORY = 100;

// Alert handlers
type AlertHandler = (alert: Alert) => void;
const alertHandlers: AlertHandler[] = [];

/**
 * Initialize the alert system with custom configurations
 * @param configs Custom alert configurations
 */
export const initAlertSystem = (configs: Partial<AlertConfig>[] = []): void => {
  // Merge custom configs with defaults
  alertConfigs = defaultAlertConfigs.map(defaultConfig => {
    const customConfig = configs.find(c => c.type === defaultConfig.type);
    return customConfig ? { ...defaultConfig, ...customConfig } : defaultConfig;
  });
  
  // Add any custom configs that don't match default types
  configs.forEach(config => {
    if (config.type && !alertConfigs.some(c => c.type === config.type)) {
      alertConfigs.push({
        type: config.type as AlertType,
        name: config.name || 'Custom Alert',
        enabled: config.enabled !== undefined ? config.enabled : true,
        severity: config.severity || AlertSeverity.WARNING,
        threshold: config.threshold || 0,
        cooldownMinutes: config.cooldownMinutes || 5,
      });
    }
  });
  
  console.log('Alert system initialized with', alertConfigs.length, 'alert configurations');
};

/**
 * Register an alert handler
 * @param handler Function to call when an alert is triggered
 * @returns Function to unregister the handler
 */
export const onAlert = (handler: AlertHandler): () => void => {
  alertHandlers.push(handler);
  return () => {
    const index = alertHandlers.indexOf(handler);
    if (index !== -1) {
      alertHandlers.splice(index, 1);
    }
  };
};

/**
 * Check if a metric exceeds its alert threshold
 * @param type Alert type
 * @param value Current metric value
 * @param metadata Additional metadata for the alert
 */
export const checkAlert = (
  type: AlertType,
  value: number,
  metadata: Record<string, any> = {}
): void => {
  // Find matching alert configuration
  const config = alertConfigs.find(c => c.type === type);
  if (!config || !config.enabled) return;
  
  // Check if value exceeds threshold
  if (value > config.threshold) {
    // Check cooldown period
    const now = Date.now();
    if (config.lastTriggered && 
        now - config.lastTriggered < config.cooldownMinutes * 60 * 1000) {
      return; // Still in cooldown period
    }
    
    // Update last triggered timestamp
    config.lastTriggered = now;
    
    // Create alert
    const alert: Alert = {
      id: `${type}-${now}`,
      type,
      name: config.name,
      message: `${config.name}: ${value} exceeds threshold of ${config.threshold}`,
      severity: config.severity,
      timestamp: now,
      value,
      threshold: config.threshold,
      metadata,
      acknowledged: false,
    };
    
    // Add to active alerts
    activeAlerts.push(alert);
    
    // Add to history
    alertHistory.unshift(alert);
    if (alertHistory.length > MAX_ALERT_HISTORY) {
      alertHistory.pop();
    }
    
    // Notify handlers
    alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    });
    
    // Log alert
    console.warn(`[ALERT] ${alert.message}`);
    
    // Send to server in production
    if (process.env.NODE_ENV === 'production') {
      sendAlertToServer(alert).catch(console.error);
    }
  }
};

/**
 * Manually trigger an alert
 * @param type Alert type
 * @param message Alert message
 * @param severity Alert severity
 * @param metadata Additional metadata
 */
export const triggerAlert = (
  type: AlertType,
  message: string,
  severity: AlertSeverity = AlertSeverity.WARNING,
  metadata: Record<string, any> = {}
): void => {
  const now = Date.now();
  
  // Create alert
  const alert: Alert = {
    id: `manual-${type}-${now}`,
    type,
    name: type,
    message,
    severity,
    timestamp: now,
    value: 0,
    threshold: 0,
    metadata,
    acknowledged: false,
  };
  
  // Add to active alerts
  activeAlerts.push(alert);
  
  // Add to history
  alertHistory.unshift(alert);
  if (alertHistory.length > MAX_ALERT_HISTORY) {
    alertHistory.pop();
  }
  
  // Notify handlers
  alertHandlers.forEach(handler => {
    try {
      handler(alert);
    } catch (error) {
      console.error('Error in alert handler:', error);
    }
  });
  
  // Log alert
  console.warn(`[ALERT] ${alert.message}`);
  
  // Send to server in production
  if (process.env.NODE_ENV === 'production') {
    sendAlertToServer(alert).catch(console.error);
  }
};

/**
 * Acknowledge an alert
 * @param alertId ID of the alert to acknowledge
 * @returns True if the alert was found and acknowledged
 */
export const acknowledgeAlert = (alertId: string): boolean => {
  const alert = activeAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
};

/**
 * Clear an active alert
 * @param alertId ID of the alert to clear
 * @returns True if the alert was found and cleared
 */
export const clearAlert = (alertId: string): boolean => {
  const index = activeAlerts.findIndex(a => a.id === alertId);
  if (index !== -1) {
    activeAlerts.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Clear all active alerts
 */
export const clearAllAlerts = (): void => {
  activeAlerts.length = 0;
};

/**
 * Get all active alerts
 * @returns Array of active alerts
 */
export const getActiveAlerts = (): Alert[] => {
  return [...activeAlerts];
};

/**
 * Get alert history
 * @returns Array of historical alerts
 */
export const getAlertHistory = (): Alert[] => {
  return [...alertHistory];
};

/**
 * Send an alert to the server for storage and notification
 * @param alert The alert to send
 */
const sendAlertToServer = async (alert: Alert): Promise<void> => {
  try {
    await fetch('/api/monitoring/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alert }),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    });
  } catch (error) {
    // Silent fail - we don't want to disrupt the user experience
    console.error('Failed to send alert to server:', error);
  }
};

// Initialize with default configuration
initAlertSystem();
