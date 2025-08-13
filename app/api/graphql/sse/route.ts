import { NextRequest } from 'next/server';
import { pubSub } from '../../../../lib/graphql/schema';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  
  if (!boardId) {
    return new Response('boardId is required', { status: 400 });
  }

  let isControllerClosed = false;
  const activeSubscriptions: AsyncIterator<unknown>[] = [];

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Helper function to safely enqueue data
      const safeEnqueue = (data: string) => {
        if (isControllerClosed) {
          return false;
        }
        
        try {
          controller.enqueue(new TextEncoder().encode(data));
          return true;
        } catch (error) {
          console.error('Error sending SSE data:', error);
          isControllerClosed = true;
          return false;
        }
      };

      // Send initial connection message
      safeEnqueue('data: {"type":"connected"}\n\n');

      // Subscribe to all board events (extended for full realtime collaboration)
      const eventTypes = [
        'boardUpdates',
        'userJoined', 
        'userLeft',
        'cursorMovement',
        'collaboratorInvited',
        'collaboratorJoined',
        'invitationStatusChanged',
        'drawingStarted',
        'drawingUpdated',
        'drawingCompleted',
        'elementAdded',
        'elementUpdated',
        'elementDeleted',
        'userPresenceUpdate',
        'textElementCreated',
        'textElementUpdated',
        'textElementDeleted',
        'textElementEditingStarted',
        'textElementEditingFinished',
        'shapeElementCreated',
        'shapeElementUpdated',
        'shapeElementDeleted',
        'shapeElementTransformed',
      ];

      const subscriptions = [
        pubSub.subscribe('boardUpdates', boardId),
        pubSub.subscribe('userJoined', boardId),
        pubSub.subscribe('userLeft', boardId),
        pubSub.subscribe('cursorMovement', boardId),
        pubSub.subscribe('collaboratorInvited', boardId),
        pubSub.subscribe('collaboratorJoined', boardId),
        pubSub.subscribe('invitationStatusChanged', boardId),
        pubSub.subscribe('drawingStarted', boardId),
        pubSub.subscribe('drawingUpdated', boardId),
        pubSub.subscribe('drawingCompleted', boardId),
        pubSub.subscribe('elementAdded', boardId),
        pubSub.subscribe('elementUpdated', boardId),
        pubSub.subscribe('elementDeleted', boardId),
        pubSub.subscribe('userPresenceUpdate', boardId),
        pubSub.subscribe('textElementAdded', boardId),
        pubSub.subscribe('textElementUpdated', boardId),
        pubSub.subscribe('textElementDeleted', boardId),
        pubSub.subscribe('textElementEditingStarted', boardId),
        pubSub.subscribe('textElementEditingFinished', boardId),
        pubSub.subscribe('shapeElementCreated', boardId),
        pubSub.subscribe('shapeElementUpdated', boardId),
        pubSub.subscribe('shapeElementDeleted', boardId),
        pubSub.subscribe('shapeElementTransformed', boardId),
      ];

      // Handle subscriptions
      subscriptions.forEach(async (sub, index) => {
        try {
          const iterator = await sub;
          activeSubscriptions.push(iterator);

          for await (const payload of iterator) {
            if (isControllerClosed) {
              break;
            }

            const eventData = {
              type: eventTypes[index],
              payload,
            };
            
            const success = safeEnqueue(`data: ${JSON.stringify(eventData)}\n\n`);
            if (!success) {
              break;
            }
          }
        } catch (error) {
          console.error(`Error in subscription ${eventTypes[index]}:`, error);
        }
      });

      // Clean up on connection close
      const cleanup = () => {
        if (!isControllerClosed) {
          isControllerClosed = true;
          
          // Clean up active subscriptions
          activeSubscriptions.forEach(sub => {
            try {
              if (sub && typeof sub.return === 'function') {
                sub.return();
              }
            } catch (error) {
              console.error('Error cleaning up subscription:', error);
            }
          });

          try {
            controller.close();
          } catch (error) {
            console.error('Error closing SSE controller:', error);
          }
        }
      };

      // Handle various disconnect scenarios
      request.signal.addEventListener('abort', cleanup);
      
      // Set up a periodic ping to detect disconnections
      const pingInterval = setInterval(() => {
        if (isControllerClosed) {
          clearInterval(pingInterval);
          return;
        }

        const success = safeEnqueue('data: {"type":"ping"}\n\n');
        if (!success) {
          clearInterval(pingInterval);
          cleanup();
        }
      }, 30000); // Ping every 30 seconds

      // Clean up ping interval on close
      const originalClose = controller.close;
      controller.close = function() {
        clearInterval(pingInterval);
        cleanup();
        return originalClose.call(this);
      };
    },

    cancel() {
      isControllerClosed = true;
      // Clean up active subscriptions
      activeSubscriptions.forEach(sub => {
        try {
          if (sub && typeof sub.return === 'function') {
            sub.return();
          }
        } catch (error) {
          console.error('Error cleaning up subscription on cancel:', error);
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
