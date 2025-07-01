export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isOnline: boolean;
}
export interface DrawingElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'line' | 'text' | 'sticky-note';
  data: Record<string, unknown>;
  style: { stroke: string; strokeWidth: number; fill?: string };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StickyNoteElement {
  id: string;
  type: 'sticky-note';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}
export interface BoardAction {
  type: string;
  data: string; // JSON string of the action
  timestamp: string;
}
export interface BoardInvitation {
  id: string;
  boardId: string;
  inviterUserId: string;
  inviteeEmail: string;
  invitationToken: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface Board {
  id: string;
  name: string;
  elements: DrawingElement[];
  collaborators: User[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  history?: BoardAction[];
  historyIndex?: number;
  pendingInvitations?: BoardInvitation[];
}
