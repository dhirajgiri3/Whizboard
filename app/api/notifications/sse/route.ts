import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

// Define interfaces for type safety
interface NotificationDocument {
  _id: string;
  type: string;
  recipientEmail: string;
  senderEmail: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

interface ChangeStreamDocument {
  operationType: string;
  fullDocument: NotificationDocument;
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userEmail = session.user.email;
    
    // Set up SSE headers
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    };

    const stream = new ReadableStream({
      start(controller: ReadableStreamDefaultController): void {
        let isConnected = true;
        let isControllerClosed = false;

        const sendEvent = (data: Record<string, unknown>): void => {
          if (!isConnected || isControllerClosed) return;
          
          try {
            const eventData = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(eventData));
          } catch (error) {
            console.error('Error sending SSE notification:', error);
          }
        };

        // Send initial connection message
        sendEvent({ type: 'connected', message: 'Notification stream connected' });

        // Set up database change stream for notifications
        const setupNotificationStream = async (): Promise<void> => {
          try {
            const db = await connectToDatabase();
            
            // Create a change stream to watch for new notifications
            const changeStream = db.collection('notifications').watch([
              {
                $match: {
                  'fullDocument.recipientEmail': userEmail,
                  'operationType': 'insert'
                }
              }
            ], {
              fullDocument: 'updateLookup'
            });

            // Listen for new notifications
            changeStream.on('change', (change: ChangeStreamDocument) => {
              if (change.operationType === 'insert' && change.fullDocument) {
                const notification = change.fullDocument;
                
                // Send the new notification to the client
                sendEvent({
                  type: 'newNotification',
                  notification: {
                    _id: notification._id,
                    type: notification.type,
                    senderEmail: notification.senderEmail,
                    data: notification.data,
                    read: notification.read,
                    createdAt: notification.createdAt
                  }
                });
              }
            });

            // Handle change stream errors
            changeStream.on('error', (error: Error) => {
              console.error('Notification change stream error:', error);
              sendEvent({ type: 'error', message: 'Notification stream error' });
            });

            // Store change stream reference for cleanup
            let changeStreamRef = changeStream;

            // Clean up on disconnect
            request.signal.addEventListener('abort', () => {
              isConnected = false;
              if (changeStreamRef) {
                changeStreamRef.close();
                changeStreamRef = null;
              }
              clearInterval(pingInterval);
              if (!isControllerClosed) {
                controller.close();
                isControllerClosed = true;
              }
            });

          } catch (error) {
            console.error('Error setting up notification stream:', error);
            sendEvent({ type: 'error', message: 'Failed to setup notification stream' });
          }
        };

        // Start the notification stream
        setupNotificationStream();

        // Send periodic ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (!isConnected) {
            clearInterval(pingInterval);
            return;
          }
          sendEvent({ type: 'ping', timestamp: Date.now() });
        }, 30000); // Ping every 30 seconds

      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error('Notification SSE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
