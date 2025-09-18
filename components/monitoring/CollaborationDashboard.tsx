'use client';

import React, { useState, useEffect } from 'react';
import { getAllBoardStatistics, getTotalActiveUsers, BoardStatistics } from '@/lib/utils/collaboration-stats';

interface CollaborationDashboardProps {
  showAlways?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * A component that displays real-time collaboration statistics
 * This is only rendered in development mode by default
 */
const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  showAlways = false,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const [statistics, setStatistics] = useState<BoardStatistics[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    // Toggle visibility with keyboard shortcut (Alt+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'c') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Update statistics periodically
    const intervalId = setInterval(() => {
      if (!isVisible && !showAlways) return;
      
      const allStats = getAllBoardStatistics();
      setStatistics(allStats);
      setTotalActiveUsers(getTotalActiveUsers());
      
      // If no board is selected but we have boards, select the first one
      if (!selectedBoardId && allStats.length > 0) {
        setSelectedBoardId(allStats[0].boardId);
      }
    }, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, [isVisible, showAlways, selectedBoardId]);

  if (!isVisible && !showAlways) return null;
  if (process.env.NODE_ENV !== 'development' && !showAlways) return null;

  // Determine position styles
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9997, // Lower than other monitors
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

  const getConnectionQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ffcc00';
      case 'poor': return '#ff4d4d';
      default: return 'inherit';
    }
  };

  const renderBoardSummary = (stats: BoardStatistics) => {
    const activeUsers = Array.from(stats.activeUsers.values()).filter(u => u.isActive);
    
    return (
      <div 
        key={stats.boardId} 
        style={{ 
          marginBottom: '8px', 
          padding: '4px', 
          borderRadius: '4px',
          cursor: 'pointer',
          backgroundColor: selectedBoardId === stats.boardId ? 
            'rgba(255, 255, 255, 0.1)' : 'transparent'
        }}
        onClick={() => setSelectedBoardId(stats.boardId)}
      >
        <div style={{ fontWeight: 'bold' }}>
          Board: {stats.boardId.substring(0, 8)}...
        </div>
        <div>Users: {activeUsers.length}</div>
        <div style={{ 
          color: getConnectionQualityColor(stats.connectionQuality)
        }}>
          Quality: {stats.connectionQuality} ({stats.averageLatency.toFixed(0)}ms)
        </div>
      </div>
    );
  };

  const renderBoardDetails = () => {
    if (!selectedBoardId) return <div>No board selected</div>;
    
    const stats = statistics.find(s => s.boardId === selectedBoardId);
    if (!stats) return <div>Board not found</div>;
    
    const activeUsers = Array.from(stats.activeUsers.values()).filter(u => u.isActive);
    const inactiveUsers = Array.from(stats.activeUsers.values()).filter(u => !u.isActive);
    
    return (
      <div>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          Board: {stats.boardId}
        </div>
        
        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Active Users ({activeUsers.length})</div>
        {activeUsers.map(user => (
          <div key={user.userId} style={{ marginBottom: '2px' }}>
            {user.username || user.userId.substring(0, 8)}
          </div>
        ))}
        
        {inactiveUsers.length > 0 && (
          <>
            <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: 'bold' }}>
              Inactive Users ({inactiveUsers.length})
            </div>
            {inactiveUsers.map(user => (
              <div key={user.userId} style={{ marginBottom: '2px', opacity: 0.6 }}>
                {user.username || user.userId.substring(0, 8)}
              </div>
            ))}
          </>
        )}
        
        <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: 'bold' }}>Elements</div>
        {Object.entries(stats.elementCounts).map(([type, count]) => (
          <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{type}:</span>
            <span>{count}</span>
          </div>
        ))}
        
        <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: 'bold' }}>Connection</div>
        <div style={{ 
          color: getConnectionQualityColor(stats.connectionQuality)
        }}>
          Quality: {stats.connectionQuality}
        </div>
        <div>Latency: {stats.averageLatency.toFixed(0)}ms</div>
        
        <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: 'bold' }}>Events</div>
        {Object.entries(stats.eventCounts).map(([type, count]) => (
          <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{type}:</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={positionStyles}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '4px' }}>
        Collaboration Dashboard
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        Total Active Users: {totalActiveUsers}
      </div>
      
      {statistics.length === 0 ? (
        <div>No active boards</div>
      ) : (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%', borderRight: '1px solid rgba(255, 255, 255, 0.2)', paddingRight: '8px', marginRight: '8px' }}>
            {statistics.map(renderBoardSummary)}
          </div>
          <div style={{ width: '50%' }}>
            {renderBoardDetails()}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '4px' }}>
        Press Alt+C to toggle
      </div>
    </div>
  );
};

export default CollaborationDashboard;
