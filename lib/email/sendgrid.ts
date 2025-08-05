import sgMail from '@sendgrid/mail';
import logger from '@/lib/logger/logger';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  logger.error('SENDGRID_API_KEY is not set in environment variables');
  throw new Error('SENDGRID_API_KEY is required for email service');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface SendGridError {
  response?: {
    status?: number;
    body?: unknown;
    headers?: Record<string, unknown>;
  };
  message?: string;
  stack?: string;
}

export interface InvitationEmailData {
  boardId: string;
  boardName: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  invitationToken: string;
  message?: string;
  boardPreview?: string; // Base64 encoded image or URL
}

export interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  inviterName?: string;
  boardName?: string;
}

export interface CollaboratorNotificationData {
  boardId: string;
  boardName: string;
  collaboratorName: string;
  collaboratorEmail: string;
  ownerEmail: string;
  ownerName: string;
}

export class EmailService {
  private static getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }

  private static getCommonEmailStyles(): string {
    return `
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
          line-height: 1.6;
        }
        .email-wrapper { 
          background-color: #f8fafc; 
          padding: 20px 0; 
          min-height: 100vh; 
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: skewY(-1deg);
          transform-origin: bottom left;
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p { 
          margin: 10px 0 0; 
          opacity: 0.95; 
          font-size: 16px; 
          font-weight: 300;
        }
        .content { 
          padding: 50px 30px; 
        }
        .invitation-card { 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px; 
          padding: 30px; 
          margin: 30px 0; 
          border-left: 6px solid #667eea; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .board-info { 
          display: flex; 
          align-items: center; 
          margin-bottom: 20px; 
        }
        .board-icon { 
          width: 50px; 
          height: 50px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-size: 24px; 
          margin-right: 15px;
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }
        .board-name { 
          font-size: 24px; 
          font-weight: 700; 
          color: #1e293b; 
          margin: 0;
        }
        .inviter-info { 
          color: #64748b; 
          font-size: 14px; 
          margin-top: 5px; 
          font-weight: 500;
        }
        .personal-message { 
          background-color: #ffffff; 
          border: 2px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          font-style: italic; 
          color: #475569; 
          position: relative;
        }
        .personal-message::before {
          content: '"';
          font-size: 48px;
          color: #cbd5e1;
          position: absolute;
          top: -10px;
          left: 10px;
          font-family: serif;
        }
        .cta-section { 
          text-align: center; 
          margin: 40px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          text-decoration: none; 
          padding: 16px 40px; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 18px; 
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .cta-button:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        .secondary-cta {
          display: inline-block;
          background: transparent;
          color: #667eea;
          text-decoration: none;
          padding: 12px 32px;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin-left: 15px;
          transition: all 0.3s ease;
        }
        .secondary-cta:hover {
          background: #667eea;
          color: white;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        .feature-item {
          text-align: center;
          padding: 20px;
        }
        .feature-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }
        .feature-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 5px;
        }
        .feature-desc {
          font-size: 14px;
          color: #64748b;
        }
        .alternative-link { 
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 8px; 
          padding: 20px; 
          margin-top: 30px; 
          border: 1px solid #cbd5e1;
        }
        .alternative-link p { 
          margin: 0 0 10px 0; 
          color: #475569; 
          font-size: 14px; 
          font-weight: 500;
        }
        .alternative-link code { 
          background-color: #1e293b; 
          color: #e2e8f0;
          padding: 8px 12px; 
          border-radius: 6px; 
          font-size: 12px; 
          word-break: break-all;
          display: block;
          margin-top: 8px;
        }
        .footer { 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0; 
        }
        .footer p { 
          margin: 5px 0; 
          color: #64748b; 
          font-size: 14px; 
        }
        .footer .logo {
          font-weight: 700;
          color: #1e293b;
          font-size: 16px;
        }
        .expiry-notice {
          background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin: 25px 0;
          text-align: center;
        }
        .expiry-notice p {
          margin: 0;
          color: #92400e;
          font-weight: 600;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .email-container { 
            margin: 10px; 
            border-radius: 8px; 
          }
          .content { 
            padding: 30px 20px; 
          }
          .header { 
            padding: 30px 20px; 
          }
          .header h1 { 
            font-size: 28px; 
          }
          .invitation-card { 
            padding: 20px; 
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .cta-button {
            display: block;
            margin: 10px 0;
          }
          .secondary-cta {
            display: block;
            margin: 10px 0;
          }
        }
      </style>
    `;
  }

  private static generateInvitationEmailHtml(data: InvitationEmailData): string {
    const { boardName, inviterName, inviteeEmail, invitationToken, message, boardPreview } = data;
    const baseUrl = this.getBaseUrl();
    const invitationUrl = `${baseUrl}/board/${data.boardId}/invite?token=${invitationToken}&email=${encodeURIComponent(inviteeEmail)}`;
    const declineUrl = `${baseUrl}/api/board/invite/decline?token=${invitationToken}&email=${encodeURIComponent(inviteeEmail)}`;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>You're Invited to Collaborate on WhizBoard</title>
          ${this.getCommonEmailStyles()}
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>🎨 WhizBoard</h1>
                <p>Real-time Collaborative Whiteboard</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">You're Invited to Collaborate!</h2>
                <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                  <strong>${inviterName}</strong> has invited you to collaborate on their whiteboard project.
                </p>
                
                <div class="invitation-card">
                  <div class="board-info">
                    <div class="board-icon">🎯</div>
                    <div>
                      <h3 class="board-name">${boardName}</h3>
                      <p class="inviter-info">Invited by ${inviterName} (${data.inviterEmail})</p>
                    </div>
                  </div>
                  
                  ${message ? `
                    <div class="personal-message">
                      <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
                    </div>
                  ` : ''}
                  
                  ${boardPreview ? `
                    <div style="text-align: center; margin: 20px 0;">
                      <img src="${boardPreview}" alt="Board Preview" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Preview of the board</p>
                    </div>
                  ` : ''}
                </div>
                
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-title">Real-time</div>
                    <div class="feature-desc">Collaborate in real-time with live cursors</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Creative Tools</div>
                    <div class="feature-desc">Draw, sketch, and brainstorm together</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">💾</div>
                    <div class="feature-title">Auto-save</div>
                    <div class="feature-desc">Never lose your work with automatic saving</div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="${invitationUrl}" class="cta-button" style="color: white; text-decoration: none;">
                    🚀 Accept Invitation & Join Board
                  </a>
                  <a href="${declineUrl}" class="secondary-cta" style="color: #667eea; text-decoration: none;">
                    Decline Invitation
                  </a>
                </div>
                
                <div class="alternative-link">
                  <p><strong>Having trouble with the buttons?</strong> Copy and paste this link into your browser:</p>
                  <code>${invitationUrl}</code>
                </div>
                
                <div class="expiry-notice">
                  <p>⏰ This invitation expires in 7 days. Don't miss out on the collaboration!</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                  If you don't have a WhizBoard account yet, you'll be prompted to create one when you accept the invitation. 
                  It's quick, free, and you can sign in with your Google account.
                </p>
              </div>
              
              <div class="footer">
                <p class="logo">WhizBoard</p>
                <p>&copy; 2025 WhizBoard. All rights reserved.</p>
                <p>Empowering teams through visual collaboration</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      // Use a verified email address - for development, use your own email or set up domain verification
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'hello@cyperstudio.in'; // Use your verified email
      
      const msg = {
        to: data.inviteeEmail,
        from: {
          email: fromEmail, // Use verified email address
          name: 'WhizBoard Team'
        },
        subject: `🎨 ${data.inviterName} invited you to collaborate on "${data.boardName}"`,
        html: this.generateInvitationEmailHtml(data),
        text: `You've been invited to collaborate on "${data.boardName}" by ${data.inviterName}. 
               
Join the board: ${this.getBaseUrl()}/board/${data.boardId}/invite?token=${data.invitationToken}&email=${encodeURIComponent(data.inviteeEmail)}

${data.message ? `Personal message: "${data.message}"` : ''}

This invitation expires in 7 days. If you don't have a WhizBoard account, you'll be prompted to create one.

--
WhizBoard Team
Real-time collaborative whiteboard for teams`,
        // Add tracking and analytics
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        // Add custom headers for better deliverability
        headers: {
          'X-Entity-Ref-ID': `board-invite-${data.boardId}`,
        },
        // Add categories for SendGrid analytics
        categories: ['board-invitation', 'collaboration']
      };

      const response = await sgMail.send(msg);
      logger.info(`Invitation email sent successfully to ${data.inviteeEmail} for board ${data.boardId}`, {
        messageId: response[0]?.headers?.['x-message-id'],
        statusCode: response[0]?.statusCode
      });
      return true;
    } catch (error: unknown) {
      // Detailed error logging for SendGrid
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as SendGridError;
        logger.error('SendGrid API Error:', {
          statusCode: sgError.response?.status,
          body: sgError.response?.body,
          headers: sgError.response?.headers,
          boardId: data.boardId,
          inviteeEmail: data.inviteeEmail
        });
      } else {
        const errorObj = error as Error;
        logger.error('Failed to send invitation email:', {
          error: errorObj.message,
          stack: errorObj.stack,
          boardId: data.boardId,
          inviteeEmail: data.inviteeEmail
        });
      }
      return false;
    }
  }

  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'dhirajgiri334@gmail.com';
      
      const msg = {
        to: data.userEmail,
        from: {
          email: fromEmail,
          name: 'WhizBoard Team'
        },
        subject: data.inviterName 
          ? `🎉 Welcome to WhizBoard! You've joined "${data.boardName}"`
          : '🎉 Welcome to WhizBoard!',
        html: this.generateWelcomeEmailHtml(data),
        text: `Welcome to WhizBoard, ${data.userName}! 

${data.inviterName ? `You've successfully joined the board "${data.boardName}" invited by ${data.inviterName}.` : ''}

We're excited to have you join our collaborative whiteboard platform. Here's what you can do:

• Create unlimited boards for your projects
• Collaborate in real-time with team members
• Use powerful drawing and annotation tools
• Share boards with anyone, anywhere

Get started: ${this.getBaseUrl()}

--
WhizBoard Team
Real-time collaborative whiteboard for teams`,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        categories: ['welcome', 'onboarding']
      };

      const response = await sgMail.send(msg);
      logger.info(`Welcome email sent successfully to ${data.userEmail}`, {
        messageId: response[0]?.headers?.['x-message-id'],
        statusCode: response[0]?.statusCode
      });
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as SendGridError;
        logger.error('SendGrid API Error (Welcome):', {
          statusCode: sgError.response?.status,
          body: sgError.response?.body,
          userEmail: data.userEmail
        });
      } else {
        const errorObj = error as Error;
        logger.error('Failed to send welcome email:', {
          error: errorObj.message,
          userEmail: data.userEmail
        });
      }
      return false;
    }
  }

  static async sendCollaboratorJoinedNotification(data: CollaboratorNotificationData): Promise<boolean> {
    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'dhirajgiri334@gmail.com';
      
      const msg = {
        to: data.ownerEmail,
        from: {
          email: fromEmail,
          name: 'WhizBoard Team'
        },
        subject: `🎉 ${data.collaboratorName} joined your board "${data.boardName}"`,
        html: this.generateCollaboratorJoinedEmailHtml(data),
        text: `Great news! ${data.collaboratorName} (${data.collaboratorEmail}) has joined your board "${data.boardName}".

You can now collaborate in real-time on your whiteboard project.

View board: ${this.getBaseUrl()}/board/${data.boardId}

--
WhizBoard Team`,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        categories: ['collaboration', 'notification']
      };

      const response = await sgMail.send(msg);
      logger.info(`Collaborator joined notification sent to ${data.ownerEmail}`, {
        messageId: response[0]?.headers?.['x-message-id'],
        statusCode: response[0]?.statusCode
      });
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as SendGridError;
        logger.error('SendGrid API Error (Notification):', {
          statusCode: sgError.response?.status,
          body: sgError.response?.body,
          ownerEmail: data.ownerEmail
        });
      } else {
        const errorObj = error as Error;
        logger.error('Failed to send collaborator joined notification:', {
          error: errorObj.message,
          ownerEmail: data.ownerEmail
        });
      }
      return false;
    }
  }

  private static generateWelcomeEmailHtml(data: WelcomeEmailData): string {
    const baseUrl = this.getBaseUrl();
    const boardUrl = data.boardName ? `${baseUrl}/board/${data.boardName}` : baseUrl;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WhizBoard</title>
          ${this.getCommonEmailStyles()}
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>🎉 Welcome to WhizBoard!</h1>
                <p>Your collaborative whiteboard journey starts here</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">
                  Hello ${data.userName}!
                </h2>
                
                ${data.inviterName ? `
                  <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                    You've successfully joined the board <strong>"${data.boardName}"</strong> invited by <strong>${data.inviterName}</strong>. 
                    Welcome to the team!
                  </p>
                ` : `
                  <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                    We're thrilled to have you join our collaborative whiteboard platform. 
                    Get ready to unleash your creativity and collaborate like never before!
                  </p>
                `}
                
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Create & Draw</div>
                    <div class="feature-desc">Unlimited boards with powerful drawing tools</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Collaborate</div>
                    <div class="feature-desc">Real-time collaboration with live cursors</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">Sync & Save</div>
                    <div class="feature-desc">Automatic saving and version history</div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="${boardUrl}" class="cta-button" style="color: white; text-decoration: none;">
                    ${data.inviterName ? '🚀 Go to Board' : '🚀 Get Started'}
                  </a>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #0ea5e9;">
                  <h3 style="color: #0c4a6e; margin-top: 0;">Quick Start Tips:</h3>
                  <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
                    <li>Use the toolbar to select different drawing tools</li>
                    <li>Press 'Ctrl+Z' to undo, 'Ctrl+Y' to redo</li>
                    <li>Share your board link to invite collaborators</li>
                    <li>All changes are saved automatically</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p class="logo">WhizBoard</p>
                <p>&copy; 2025 WhizBoard. All rights reserved.</p>
                <p>Empowering teams through visual collaboration</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateCollaboratorJoinedEmailHtml(data: CollaboratorNotificationData): string {
    const baseUrl = this.getBaseUrl();
    const boardUrl = `${baseUrl}/board/${data.boardId}`;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Collaborator Joined</title>
          ${this.getCommonEmailStyles()}
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <h1>🎉 WhizBoard</h1>
                <p>Collaboration Update</p>
              </div>
              
              <div class="content">
                <h2 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">
                  Great news, ${data.ownerName}!
                </h2>
                
                <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                  <strong>${data.collaboratorName}</strong> has joined your board and is ready to collaborate.
                </p>
                
                <div class="invitation-card">
                  <div class="board-info">
                    <div class="board-icon">🎯</div>
                    <div>
                      <h3 class="board-name">${data.boardName}</h3>
                      <p class="inviter-info">New collaborator: ${data.collaboratorName} (${data.collaboratorEmail})</p>
                    </div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <a href="${boardUrl}" class="cta-button" style="color: white; text-decoration: none;">
                    🚀 View Board & Collaborate
                  </a>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #22c55e;">
                  <h3 style="color: #15803d; margin-top: 0;">Collaboration Features:</h3>
                  <ul style="color: #16a34a; margin: 0; padding-left: 20px;">
                    <li>See live cursors of all collaborators</li>
                    <li>Real-time drawing and editing</li>
                    <li>Instant synchronization across all devices</li>
                    <li>Collaborative history and undo/redo</li>
                  </ul>
                </div>
              </div>
              
              <div class="footer">
                <p class="logo">WhizBoard</p>
                <p>&copy; 2025 WhizBoard. All rights reserved.</p>
                <p>Empowering teams through visual collaboration</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
