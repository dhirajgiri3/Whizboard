import React from 'react';

interface CanvasPerformanceOptimizerProps {
  children: React.ReactNode;
  isEnabled?: boolean;
}

export default function CanvasPerformanceOptimizer({ 
  children, 
  isEnabled = true 
}: CanvasPerformanceOptimizerProps) {
  // Simple wrapper component for performance optimization
  // This can be enhanced later with actual performance monitoring
  
  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Development-only performance debug overlay */}
      {process.env.NODE_ENV === 'development' && isEnabled && (
        <div className="performance-debug" style={{ display: 'none' }}>
          {/* Performance metrics would go here if needed */}
        </div>
      )}
    </>
  );
} 