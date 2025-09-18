'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic imports for monitoring components
const DevMemoryMonitor = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@/lib/utils/memory-monitor').then((mod) => mod.default)
    : Promise.resolve(() => null),
  { ssr: false }
);

const ErrorTrackingInitializer = dynamic(
  () => import('@/components/monitoring/ErrorTrackingInitializer'),
  { ssr: false }
);

const PerformanceDashboard = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@/components/monitoring/PerformanceDashboard').then((mod) => mod.default)
    : Promise.resolve(() => null),
  { ssr: false }
);

const CollaborationDashboard = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@/components/monitoring/CollaborationDashboard').then((mod) => mod.default)
    : Promise.resolve(() => null),
  { ssr: false }
);

const AlertDashboard = dynamic(
  () => process.env.NODE_ENV === 'development' 
    ? import('@/components/monitoring/AlertDashboard').then((mod) => mod.default)
    : Promise.resolve(() => null),
  { ssr: false }
);

const AlertNotifications = dynamic(
  () => import('@/components/monitoring/AlertNotifications'),
  { ssr: false }
);

const ConnectionQualityMonitor = dynamic(
  () => import('@/components/monitoring/ConnectionQualityMonitor'),
  { ssr: false }
);

interface MonitoringWrapperProps {
  // Optional props for positioning if needed
}

const MonitoringWrapper: React.FC<MonitoringWrapperProps> = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Development-only memory monitor */}
      <DevMemoryMonitor />
      
      {/* Initialize error tracking */}
      <ErrorTrackingInitializer />
      
      {/* Performance dashboard */}
      <PerformanceDashboard position="bottom-left" />
      
      {/* Collaboration dashboard */}
      <CollaborationDashboard position="top-right" />
      
      {/* Alert dashboard */}
      <AlertDashboard position="top-left" />
      
      {/* Alert notifications */}
      <AlertNotifications position="bottom-right" maxAlerts={3} autoHideSeconds={10} />
      
      {/* Connection quality monitor */}
      <ConnectionQualityMonitor position="top-right" />
    </>
  );
};

export default MonitoringWrapper;
