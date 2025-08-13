import logger from './logger';

export interface SecurityEvent {
  timestamp: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTH_ATTEMPT' | 'RATE_LIMIT' | 'CSRF_VIOLATION' | 'INVALID_INPUT' | 'FILE_UPLOAD' | 'API_ACCESS' | 'ERROR' | 'WARNING';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  method?: string;
  statusCode?: number;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: 'API' | 'AUTH' | 'FILE' | 'GRAPHQL' | 'MIDDLEWARE' | 'SYSTEM';
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsBySource: Record<string, number>;
  recentFailures: SecurityEvent[];
  suspiciousIPs: string[];
  rateLimitViolations: number;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events
  private readonly suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /owasp/i,
    /xss/i,
    /injection/i,
    /script/i,
    /eval\(/i,
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /on\w+=/i,
  ];

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Add to events array
    this.events.push(fullEvent);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console with appropriate level
    this.logToConsole(fullEvent);
    
    // Check for suspicious patterns
    this.detectSuspiciousActivity(fullEvent);
    
    // Alert on critical events
    if (fullEvent.severity === 'CRITICAL') {
      this.alertCriticalEvent(fullEvent);
    }
  }

  private logToConsole(event: SecurityEvent): void {
    const logMessage = `[SECURITY] ${event.eventType} - ${event.severity} - ${event.source} - ${event.userEmail || 'anonymous'} - ${event.ipAddress || 'unknown'}`;
    
    switch (event.severity) {
      case 'CRITICAL':
        logger.error(logMessage, event);
        break;
      case 'HIGH':
        logger.warn(logMessage, event);
        break;
      case 'MEDIUM':
        logger.info(logMessage, event);
        break;
      case 'LOW':
        logger.debug(logMessage, event);
        break;
    }
  }

  private detectSuspiciousActivity(event: SecurityEvent): void {
    // Check for suspicious patterns in details
    const detailsStr = JSON.stringify(event.details).toLowerCase();
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(detailsStr)) {
        this.logEvent({
          eventType: 'WARNING',
          severity: 'HIGH',
          source: 'SYSTEM',
          details: {
            originalEvent: event,
            suspiciousPattern: pattern.source,
            message: 'Suspicious activity pattern detected'
          }
        });
        break;
      }
    }
  }

  private alertCriticalEvent(event: SecurityEvent): void {
    // In production, this would send alerts via email, Slack, etc.
    logger.error(`🚨 CRITICAL SECURITY EVENT: ${event.eventType}`, {
      event,
      alert: 'CRITICAL_SECURITY_EVENT',
      timestamp: new Date().toISOString()
    });
  }

  // Authentication event logging
  logAuthSuccess(userId: string, userEmail: string, ipAddress: string, userAgent: string): void {
    this.logEvent({
      eventType: 'AUTH_SUCCESS',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      details: { message: 'User successfully authenticated' },
      severity: 'LOW',
      source: 'AUTH'
    });
  }

  logAuthFailure(userEmail: string, ipAddress: string, userAgent: string, reason: string): void {
    this.logEvent({
      eventType: 'AUTH_FAILURE',
      userEmail,
      ipAddress,
      userAgent,
      details: { reason, message: 'Authentication failed' },
      severity: 'MEDIUM',
      source: 'AUTH'
    });
  }

  logAuthAttempt(userEmail: string, ipAddress: string, userAgent: string, provider: string): void {
    this.logEvent({
      eventType: 'AUTH_ATTEMPT',
      userEmail,
      ipAddress,
      userAgent,
      details: { provider, message: 'Authentication attempt' },
      severity: 'LOW',
      source: 'AUTH'
    });
  }

  // Rate limiting events
  logRateLimit(ipAddress: string, userAgent: string, resource: string, limit: number): void {
    this.logEvent({
      eventType: 'RATE_LIMIT',
      ipAddress,
      userAgent,
      resource,
      details: { limit, message: 'Rate limit exceeded' },
      severity: 'MEDIUM',
      source: 'MIDDLEWARE'
    });
  }

  // CSRF violations
  logCSRFViolation(ipAddress: string, userAgent: string, resource: string, method: string): void {
    this.logEvent({
      eventType: 'CSRF_VIOLATION',
      ipAddress,
      userAgent,
      resource,
      method,
      details: { message: 'CSRF token validation failed' },
      severity: 'HIGH',
      source: 'MIDDLEWARE'
    });
  }

  // Invalid input
  logInvalidInput(userId: string, userEmail: string, ipAddress: string, resource: string, method: string, details: any): void {
    this.logEvent({
      eventType: 'INVALID_INPUT',
      userId,
      userEmail,
      ipAddress,
      resource,
      method,
      details: { ...details, message: 'Invalid input detected' },
      severity: 'MEDIUM',
      source: 'API'
    });
  }

  // File upload events
  logFileUpload(userId: string, userEmail: string, ipAddress: string, fileName: string, fileSize: number, fileType: string): void {
    this.logEvent({
      eventType: 'FILE_UPLOAD',
      userId,
      userEmail,
      ipAddress,
      details: { fileName, fileSize, fileType, message: 'File upload' },
      severity: 'LOW',
      source: 'FILE'
    });
  }

  // API access
  logAPIAccess(userId: string, userEmail: string, ipAddress: string, resource: string, method: string, statusCode: number): void {
    this.logEvent({
      eventType: 'API_ACCESS',
      userId,
      userEmail,
      ipAddress,
      resource,
      method,
      statusCode,
      details: { message: 'API access' },
      severity: 'LOW',
      source: 'API'
    });
  }

  // Error logging
  logError(error: Error, context: Partial<SecurityEvent>): void {
    this.logEvent({
      eventType: 'ERROR',
      severity: 'HIGH',
      source: 'SYSTEM',
      details: {
        error: error.message,
        stack: error.stack,
        context,
        message: 'Security-related error occurred'
      }
    });
  }

  // Get security metrics
  getMetrics(): SecurityMetrics {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneHourAgo
    );

    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySource = this.events.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentFailures = recentEvents.filter(event => 
      event.eventType === 'AUTH_FAILURE' || event.eventType === 'CSRF_VIOLATION'
    );

    const suspiciousIPs = Array.from(new Set(
      this.events
        .filter(event => event.severity === 'HIGH' || event.severity === 'CRITICAL')
        .map(event => event.ipAddress)
        .filter(Boolean)
    ));

    const rateLimitViolations = this.events.filter(event => 
      event.eventType === 'RATE_LIMIT'
    ).length;

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      eventsBySource,
      recentFailures,
      suspiciousIPs,
      rateLimitViolations
    };
  }

  // Get events by filter
  getEvents(filter: Partial<SecurityEvent>): SecurityEvent[] {
    return this.events.filter(event => {
      for (const [key, value] of Object.entries(filter)) {
        if (event[key as keyof SecurityEvent] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  // Clear old events
  clearOldEvents(olderThanHours: number): void {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > cutoff
    );
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export convenience functions
export const logAuthSuccess = securityLogger.logAuthSuccess.bind(securityLogger);
export const logAuthFailure = securityLogger.logAuthFailure.bind(securityLogger);
export const logAuthAttempt = securityLogger.logAuthAttempt.bind(securityLogger);
export const logRateLimit = securityLogger.logRateLimit.bind(securityLogger);
export const logCSRFViolation = securityLogger.logCSRFViolation.bind(securityLogger);
export const logInvalidInput = securityLogger.logInvalidInput.bind(securityLogger);
export const logFileUpload = securityLogger.logFileUpload.bind(securityLogger);
export const logAPIAccess = securityLogger.logAPIAccess.bind(securityLogger);
export const logError = securityLogger.logError.bind(securityLogger);
