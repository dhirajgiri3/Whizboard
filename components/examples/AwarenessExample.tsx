"use client";

import React, { useEffect, useState } from 'react';
import { CRDTProvider } from '@/lib/crdt/CRDTProvider';
import { useAwarenessCollaboration } from '@/hooks';
import LiveCursorsAware from '@/components/reatime/LiveCursorsAware';
import { Stage, Layer } from 'react-konva';

interface AwarenessExampleProps {
  boardId: string;
  userId: string;
  userName: string;
}

function AwarenessCanvas() {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const collaboration = useAwarenessCollaboration({
    boardId: 'example-board',
    userId: 'user-1',
    userName: 'Example User',
    onCursorMove: (cursors) => {
      console.log('Cursors updated:', Object.keys(cursors).length);
    },
    onPresenceUpdate: (presence) => {
      console.log('Presence updated:', Object.keys(presence).length);
    },
    onUserJoined: (userId, userName) => {
      console.log(`User ${userName} (${userId}) joined`);
    },
    onUserLeft: (userId) => {
      console.log(`User ${userId} left`);
    },
  });

  // Handle mouse movement
  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (pointerPosition) {
      setCursorPosition(pointerPosition);
      collaboration.broadcastCursorMovement(
        pointerPosition.x,
        pointerPosition.y,
        'select', // current tool
        false, // isDrawing
        false, // isSelecting
        undefined, // activeElementId
        0.5 // pressure
      );
    }
  };

  return (
    <div className="w-full h-full bg-gray-100">
      <div className="p-4 bg-white border-b">
        <h2 className="text-lg font-semibold">Phase 3: Awareness Protocol Demo</h2>
        <div className="text-sm text-gray-600 mt-1">
          Connected: {collaboration.isConnected ? '✅' : '❌'} |
          Users: {collaboration.connectedUsers} |
          Stats: {JSON.stringify(collaboration.getConnectionStats())}
        </div>
      </div>

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => collaboration.updateUserPresence({ status: 'online', currentActivity: 'Active on canvas' })}
        onMouseLeave={() => collaboration.updateUserPresence({ status: 'away', currentActivity: 'Away from canvas' })}
      >
        <Layer>
          {/* Background */}
          <rect width={stageSize.width} height={stageSize.height} fill="white" />

          {/* Live cursors using new awareness system */}
          <LiveCursorsAware
            currentTool="select"
            isDrawing={false}
            isSelecting={false}
          />
        </Layer>
      </Stage>

      <div className="p-4 bg-white border-t text-xs">
        <div>Your cursor: ({cursorPosition.x.toFixed(0)}, {cursorPosition.y.toFixed(0)})</div>
        <div>Editing users: {JSON.stringify(collaboration.getEditingUsers())}</div>
      </div>
    </div>
  );
}

export default function AwarenessExample({ boardId, userId, userName }: AwarenessExampleProps) {
  return (
    <CRDTProvider config={{ boardId, userId }}>
      <AwarenessCanvas />
    </CRDTProvider>
  );
}