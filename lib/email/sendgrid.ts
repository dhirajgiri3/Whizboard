import sgMail from '@sendgrid/mail';
import logger from '@/lib/logger/logger';
import '@/lib/env';

// Initialize SendGrid with API key (lazy initialization)
let isInitialized = false;

function initializeSendGrid() {
  if (isInitialized) return;
  
  if (!process.env.SENDGRID_API_KEY) {
    logger.error('SENDGRID_API_KEY is not set in environment variables');
    throw new Error('SENDGRID_API_KEY is required for email service');
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  isInitialized = true;
}

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

export interface WorkspaceInvitationEmailData {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  invitationToken: string;
  role: string;
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
        /* Base */
        body {
          margin: 0;
          padding: 0;
          background-color: #F3F4F6; /* gray-100 */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          line-height: 1.6;
          color: #111827; /* gray-900 */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .email-wrapper {
          padding: 24px 0;
        }
        .email-container {
          max-width: 640px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #E5E7EB; /* gray-200 */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }
        .header {
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          height: 24px;
          width: auto;
          display: inline-block;
        }
        .brand-name {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .content {
          padding: 28px 24px 24px 24px;
        }
        h1, h2, h3 {
          color: #111827;
          margin: 0 0 8px 0;
        }
        h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
        p { color: #4B5563; /* gray-600 */ font-size: 16px; margin: 0 0 16px 0; }
        .section {
          background-color: #F9FAFB; /* gray-50 */
          border: 1px solid #F3F4F6; /* gray-100 */
          border-radius: 10px;
          padding: 16px;
          margin: 16px 0;
        }
        .meta { color: #6B7280; font-size: 14px; }
        .card {
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 16px;
          margin: 16px 0;
          background: #FFFFFF;
        }
        .cta { margin: 24px 0 8px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .button {
          display: inline-block;
          background-color: #2563EB; /* primary blue-600 */
          color: #FFFFFF;
          text-decoration: none;
          padding: 12px 20px;
          min-height: 44px;
          line-height: 20px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 10px;
        }
        .button:hover { background-color: #1D4ED8; /* blue-700 */ }
        .button-secondary {
          display: inline-block;
          background-color: transparent;
          color: #1D4ED8; /* slightly darker for contrast */
          text-decoration: none;
          padding: 10px 16px;
          border: 1px solid #93C5FD; /* blue-300 */
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-left: 0;
        }
        .muted { color: #6B7280; font-size: 12px; }
        .alt-link {
          background-color: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 12px;
          margin-top: 16px;
          word-break: break-all;
        }
        .alt-link code {
          display: block;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          font-size: 13px;
          color: #111827;
          background: #F3F4F6;
          padding: 8px 10px;
          border-radius: 8px;
        }
        .footer {
          padding: 18px 24px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
        }
        .footer p { margin: 4px 0; font-size: 12px; color: #6B7280; }
        .warning {
          background: #FEF3C7; /* amber-100 */
          border: 1px solid #F59E0B; /* amber-500 */
          color: #92400E; /* amber-800 */
          border-radius: 10px;
          padding: 10px 12px;
          text-align: center;
          font-size: 12px;
          margin: 16px 0 0 0;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px 16px; }
          .header { padding: 16px; }
          .email-container { border-radius: 10px; margin: 8px; }
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
                <p class="brand-name">WhizBoard</p>
              </div>
              
              <div class="content">
                <h2>You're invited to collaborate</h2>
                <p>
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
                
                
                
                <div class="cta-section">
                  <a href="${invitationUrl}" class="button">Accept invitation and join board</a>
                  <a href="${declineUrl}" class="button-secondary">Decline</a>
                </div>
                
                <div class="alt-link">
                  <p style="margin:0 0 8px 0; font-weight:600; color:#374151;">Having trouble with the button?</p>
                  <code>${invitationUrl}</code>
                </div>
                
                <p class="warning">This invitation expires in 7 days.</p>
                
                <p class="muted" style="margin-top:12px;">
                  If you don't have a WhizBoard account yet, you'll be prompted to create one when you accept the invitation. 
                  It's quick, free, and you can sign in with your Google account.
                </p>
              </div>
              
              <div class="footer">
                <p>&copy; 2025 WhizBoard</p>
                <p>Real-time collaborative whiteboard for teams</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      initializeSendGrid();
      // Use a verified email address - for development, use your own email or set up domain verification
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'Hello@cyperstudio.in';
      
      const msg = {
        to: data.inviteeEmail,
        from: {
          email: fromEmail, // Use verified email address
          name: 'WhizBoard Team'
        },
        subject: `${data.inviterName} invited you to collaborate on "${data.boardName}" - WhizBoard`,
        html: this.generateInvitationEmailHtml(data),
        text: `You've been invited to collaborate on "${data.boardName}" by ${data.inviterName}. 
               
Join the board: ${this.getBaseUrl()}/board/${data.boardId}/invite?token=${data.invitationToken}&email=${encodeURIComponent(data.inviteeEmail)}

${data.message ? `Personal message: "${data.message}"` : ''}

This invitation expires in 7 days. If you don't have a WhizBoard account, you'll be prompted to create one.

--
WhizBoard Team
Real-time collaborative whiteboard for teams`,
            // Add basic tracking
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false }
    },
        // Add custom headers for better deliverability
        headers: {
          'X-Entity-Ref-ID': `board-invite-${data.boardId}`,
        },
        // Add categories for email organization
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
      initializeSendGrid();
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'Hello@cyperstudio.in';
      
      const msg = {
        to: data.userEmail,
        from: {
          email: fromEmail,
          name: 'WhizBoard Team'
        },
        subject: data.inviterName 
          ? `Welcome to WhizBoard — You joined "${data.boardName}"`
          : 'Welcome to WhizBoard',
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
          clickTracking: { enable: false },
          openTracking: { enable: false }
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
      initializeSendGrid();
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'Hello@cyperstudio.in';
      
      const msg = {
        to: data.ownerEmail,
        from: {
          email: fromEmail,
          name: 'WhizBoard Team'
        },
        subject: `${data.collaboratorName} joined your board "${data.boardName}" - WhizBoard`,
        html: this.generateCollaboratorJoinedEmailHtml(data),
        text: `Great news! ${data.collaboratorName} (${data.collaboratorEmail}) has joined your board "${data.boardName}".

You can now collaborate in real-time on your whiteboard project.

View board: ${this.getBaseUrl()}/board/${data.boardId}

--
WhizBoard Team`,
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false }
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
                <p class="brand-name">WhizBoard</p>
              </div>
              
              <div class="content">
                <h2>Hello ${data.userName}!</h2>
                
                ${data.inviterName ? `
                  <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
                    You've successfully joined the board <strong>"${data.boardName}"</strong> invited by <strong>${data.inviterName}</strong>. 
                    Welcome to the team!
                  </p>
                ` : `
                  <p>We’re excited to have you. Create boards, collaborate in real-time, and bring ideas to life.</p>
                `}
                
                <div class="section">
                  <h3 style="font-size:16px; margin:0 0 8px 0;">Quick start</h3>
                  <ul style="padding-left:18px; margin:0; color:#4B5563; font-size:14px;">
                    <li>Create a new board and sketch ideas</li>
                    <li>Invite teammates to collaborate</li>
                    <li>Use text, shapes, and sticky notes</li>
                  </ul>
                </div>
                
                <div class="cta">
                  <a href="${boardUrl}" class="button">${data.inviterName ? 'Open WhizBoard' : 'Get started'}</a>
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
                <p>&copy; 2025 WhizBoard</p>
                <p>Real-time collaborative whiteboard for teams</p>
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
                <p class="brand-name">WhizBoard</p>
              </div>
              
              <div class="content">
                <h2>New collaborator joined</h2>
                <p class="meta">${data.collaboratorName} (${data.collaboratorEmail}) joined your board</p>
                <div class="card">
                  <h3 style="margin:0; font-size:16px;">${data.boardName}</h3>
                </div>
                <div class="cta">
                  <a href="${boardUrl}" class="button">Open board</a>
                </div>
              </div>
              
              <div class="footer">
                <p>&copy; 2025 WhizBoard</p>
                <p>Real-time collaborative whiteboard for teams</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public static async sendWorkspaceInvitationEmail(data: WorkspaceInvitationEmailData): Promise<boolean> {
    try {
      initializeSendGrid();
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'Hello@cyperstudio.in';
      
      const msg = {
        to: data.inviteeEmail,
        from: {
          email: fromEmail,
          name: 'WhizBoard Team'
        },
        subject: `${data.inviterName} invited you to join "${data.workspaceName}" workspace - WhizBoard`,
        html: this.generateWorkspaceInvitationEmailHtml(data),
        text: `${data.inviterName} has invited you to join the "${data.workspaceName}" workspace on WhizBoard as a ${data.role}.

Accept invitation: ${this.getBaseUrl()}/workspace/invite?token=${data.invitationToken}&email=${encodeURIComponent(data.inviteeEmail)}

This invitation expires in 7 days.

--
WhizBoard Team
Real-time collaborative whiteboard for teams`,
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false },
        },
      };

      await sgMail.send(msg);
      logger.info(`Workspace invitation email sent to ${data.inviteeEmail} for workspace ${data.workspaceName}`);
      return true;

    } catch (error) {
      logger.error('Failed to send workspace invitation email:', error);
      return false;
    }
  }

  private static generateWorkspaceInvitationEmailHtml(data: WorkspaceInvitationEmailData): string {
    const { workspaceName, inviterName, inviteeEmail, invitationToken, role } = data;

    const baseUrl = this.getBaseUrl();
    const invitationUrl = `${baseUrl}/workspace/invite?token=${invitationToken}&email=${encodeURIComponent(inviteeEmail)}`;
    const declineUrl = `${baseUrl}/api/workspace/invite/decline?token=${invitationToken}&email=${encodeURIComponent(inviteeEmail)}`;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Workspace Invitation - WhizBoard</title>
          ${this.getCommonEmailStyles()}
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="header">
                <p class="brand-name">WhizBoard</p>
              </div>
              <div class="content">
                <h2>You're invited to join a workspace</h2>
                <p class="meta">Invited by ${inviterName}</p>
                <div class="card">
                  <h3 style="margin:0 0 6px 0; font-size:16px;">${workspaceName}</h3>
                  <p class="meta" style="margin:0;">Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                </div>
                <div class="cta">
                  <a href="${invitationUrl}" class="button">Accept invitation</a>
                  <a href="${declineUrl}" class="button-secondary">Decline</a>
                </div>
                <div class="alt-link">
                  <p style="margin:0 0 8px 0; font-weight:600; color:#374151;">Having trouble with the button?</p>
                  <code>${invitationUrl}</code>
                </div>
                <p class="warning">This invitation expires in 7 days.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 WhizBoard</p>
                <p>Real-time collaborative whiteboard for teams</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
