/**
 * Collaboration Test Helpers
 * 
 * This module provides utilities for testing real-time collaboration components,
 * including simulating multiple users, board events, and collaboration scenarios.
 */

import { vi } from 'vitest';
import { MockWebSocket } from './real-time-test-utils';

// Types for board elements
export interface BoardElement {
  id: string;
  type: string;
  [key: string]: any;
}

// Types for board state
export interface BoardState {
  id: string;
  name: string;
  elements: Record<string, BoardElement>;
  users: Record<string, BoardUser>;
  [key: string]: any;
}

// Types for board user
export interface BoardUser {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  isActive: boolean;
  [key: string]: any;
}

// Types for board events
export type BoardEventType = 
  | 'user_joined'
  | 'user_left'
  | 'cursor_moved'
  | 'element_created'
  | 'element_updated'
  | 'element_deleted'
  | 'board_updated'
  | 'board_sync'
  | 'connection_state_changed'
  | 'error';

export interface BoardEvent {
  type: BoardEventType;
  boardId: string;
  userId?: string;
  timestamp: number;
  data?: any;
}

// Create a mock board state
export function createMockBoardState(
  boardId: string = 'board-1',
  name: string = 'Test Board',
  elements: Record<string, BoardElement> = {},
  users: Record<string, BoardUser> = {}
): BoardState {
  return {
    id: boardId,
    name,
    elements,
    users,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Create a mock board user
export function createMockBoardUser(
  id: string = 'user-1',
  name: string = 'Test User',
  color: string = '#ff0000'
): BoardUser {
  return {
    id,
    name,
    color,
    isActive: true,
    joinedAt: Date.now(),
  };
}

// Create a mock board element
export function createMockBoardElement(
  id: string,
  type: string,
  props: Record<string, any> = {}
): BoardElement {
  return {
    id,
    type,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...props,
  };
}

// Create a mock board event
export function createMockBoardEvent(
  type: BoardEventType,
  boardId: string,
  userId?: string,
  data?: any
): BoardEvent {
  return {
    type,
    boardId,
    userId,
    timestamp: Date.now(),
    data,
  };
}

// Mock WebSocket server for testing collaboration
export class MockCollaborationServer {
  private boards: Record<string, BoardState> = {};
  private connections: Map<string, MockWebSocket> = new Map();
  private eventHandlers: Record<string, ((event: BoardEvent) => void)[]> = {};
  
  constructor() {
    // Initialize with default event handlers
    this.eventHandlers = {
      user_joined: [],
      user_left: [],
      cursor_moved: [],
      element_created: [],
      element_updated: [],
      element_deleted: [],
      board_updated: [],
      board_sync: [],
      connection_state_changed: [],
      error: [],
    };
  }
  
  // Add a board
  public addBoard(board: BoardState): void {
    this.boards[board.id] = { ...board };
  }
  
  // Get a board
  public getBoard(boardId: string): BoardState | undefined {
    return this.boards[boardId];
  }
  
  // Add a user to a board
  public addUserToBoard(boardId: string, user: BoardUser): void {
    if (!this.boards[boardId]) {
      throw new Error(`Board ${boardId} not found`);
    }
    
    this.boards[boardId].users[user.id] = { ...user };
    
    // Broadcast user joined event
    this.broadcastEvent(createMockBoardEvent(
      'user_joined',
      boardId,
      user.id,
      { user }
    ));
  }
  
  // Remove a user from a board
  public removeUserFromBoard(boardId: string, userId: string): void {
    if (!this.boards[boardId] || !this.boards[boardId].users[userId]) {
      return;
    }
    
    delete this.boards[boardId].users[userId];
    
    // Broadcast user left event
    this.broadcastEvent(createMockBoardEvent(
      'user_left',
      boardId,
      userId
    ));
  }
  
  // Add an element to a board
  public addElementToBoard(boardId: string, element: BoardElement, userId?: string): void {
    if (!this.boards[boardId]) {
      throw new Error(`Board ${boardId} not found`);
    }
    
    this.boards[boardId].elements[element.id] = { ...element };
    
    // Broadcast element created event
    this.broadcastEvent(createMockBoardEvent(
      'element_created',
      boardId,
      userId,
      { element }
    ));
  }
  
  // Update an element on a board
  public updateElementOnBoard(boardId: string, element: BoardElement, userId?: string): void {
    if (!this.boards[boardId] || !this.boards[boardId].elements[element.id]) {
      throw new Error(`Element ${element.id} not found on board ${boardId}`);
    }
    
    this.boards[boardId].elements[element.id] = { 
      ...this.boards[boardId].elements[element.id],
      ...element,
      updatedAt: Date.now(),
    };
    
    // Broadcast element updated event
    this.broadcastEvent(createMockBoardEvent(
      'element_updated',
      boardId,
      userId,
      { element }
    ));
  }
  
  // Remove an element from a board
  public removeElementFromBoard(boardId: string, elementId: string, userId?: string): void {
    if (!this.boards[boardId] || !this.boards[boardId].elements[elementId]) {
      return;
    }
    
    const element = this.boards[boardId].elements[elementId];
    delete this.boards[boardId].elements[elementId];
    
    // Broadcast element deleted event
    this.broadcastEvent(createMockBoardEvent(
      'element_deleted',
      boardId,
      userId,
      { elementId, element }
    ));
  }
  
  // Update cursor position
  public updateCursorPosition(boardId: string, userId: string, position: { x: number; y: number }): void {
    if (!this.boards[boardId] || !this.boards[boardId].users[userId]) {
      return;
    }
    
    this.boards[boardId].users[userId].cursorPosition = { ...position };
    
    // Broadcast cursor moved event
    this.broadcastEvent(createMockBoardEvent(
      'cursor_moved',
      boardId,
      userId,
      { position }
    ));
  }
  
  // Register a WebSocket connection
  public registerConnection(connection: MockWebSocket, boardId: string, userId: string): void {
    const connectionId = `${boardId}:${userId}`;
    this.connections.set(connectionId, connection);
    
    // Set up message handling
    connection.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleClientMessage(message, connection, boardId, userId);
      } catch (error) {
        console.error('Error handling client message:', error);
      }
    });
    
    // Set up close handling
    connection.addEventListener('close', () => {
      this.connections.delete(connectionId);
      this.removeUserFromBoard(boardId, userId);
    });
    
    // Send initial board state
    this.sendBoardState(connection, boardId);
  }
  
  // Handle a message from a client
  private handleClientMessage(message: any, connection: MockWebSocket, boardId: string, userId: string): void {
    if (!message.type) return;
    
    switch (message.type) {
      case 'cursor_moved':
        if (message.position) {
          this.updateCursorPosition(boardId, userId, message.position);
        }
        break;
        
      case 'element_created':
        if (message.element) {
          this.addElementToBoard(boardId, message.element, userId);
        }
        break;
        
      case 'element_updated':
        if (message.element) {
          this.updateElementOnBoard(boardId, message.element, userId);
        }
        break;
        
      case 'element_deleted':
        if (message.elementId) {
          this.removeElementFromBoard(boardId, message.elementId, userId);
        }
        break;
        
      case 'board_sync_request':
        this.sendBoardState(connection, boardId);
        break;
        
      default:
        // Trigger event handler for custom event types
        this.triggerEvent(message.type, createMockBoardEvent(
          message.type as BoardEventType,
          boardId,
          userId,
          message.data
        ));
    }
  }
  
  // Send the current board state to a connection
  private sendBoardState(connection: MockWebSocket, boardId: string): void {
    const board = this.boards[boardId];
    if (!board) return;
    
    connection.simulateMessage(JSON.stringify({
      type: 'board_sync',
      boardId,
      timestamp: Date.now(),
      data: { board },
    }));
    
    // Trigger board sync event
    this.triggerEvent('board_sync', createMockBoardEvent(
      'board_sync',
      boardId,
      undefined,
      { board }
    ));
  }
  
  // Broadcast an event to all connections for a board
  private broadcastEvent(event: BoardEvent): void {
    const { boardId } = event;
    
    // Send to all connections for this board
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connectionId.startsWith(`${boardId}:`)) {
        connection.simulateMessage(JSON.stringify(event));
      }
    }
    
    // Trigger event handlers
    this.triggerEvent(event.type, event);
  }
  
  // Register an event handler
  public on(eventType: BoardEventType, handler: (event: BoardEvent) => void): () => void {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    
    this.eventHandlers[eventType].push(handler);
    
    // Return a function to unregister the handler
    return () => {
      const index = this.eventHandlers[eventType].indexOf(handler);
      if (index !== -1) {
        this.eventHandlers[eventType].splice(index, 1);
      }
    };
  }
  
  // Trigger event handlers for an event
  private triggerEvent(eventType: string, event: BoardEvent): void {
    if (!this.eventHandlers[eventType]) return;
    
    for (const handler of this.eventHandlers[eventType]) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in ${eventType} event handler:`, error);
      }
    }
  }
  
  // Simulate a network disconnection for a user
  public simulateDisconnection(boardId: string, userId: string): void {
    const connectionId = `${boardId}:${userId}`;
    const connection = this.connections.get(connectionId);
    
    if (connection) {
      connection.simulateClose(1001, 'Simulated disconnection');
      this.connections.delete(connectionId);
      
      // Mark user as inactive but don't remove them
      if (this.boards[boardId]?.users[userId]) {
        this.boards[boardId].users[userId].isActive = false;
      }
      
      // Broadcast connection state changed event
      this.broadcastEvent(createMockBoardEvent(
        'connection_state_changed',
        boardId,
        userId,
        { state: 'disconnected' }
      ));
    }
  }
  
  // Simulate a network reconnection for a user
  public simulateReconnection(boardId: string, userId: string, connection: MockWebSocket): void {
    const connectionId = `${boardId}:${userId}`;
    
    // Register the new connection
    this.connections.set(connectionId, connection);
    
    // Mark user as active
    if (this.boards[boardId]?.users[userId]) {
      this.boards[boardId].users[userId].isActive = true;
    }
    
    // Set up message handling
    connection.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleClientMessage(message, connection, boardId, userId);
      } catch (error) {
        console.error('Error handling client message:', error);
      }
    });
    
    // Send initial board state
    this.sendBoardState(connection, boardId);
    
    // Broadcast connection state changed event
    this.broadcastEvent(createMockBoardEvent(
      'connection_state_changed',
      boardId,
      userId,
      { state: 'connected' }
    ));
  }
  
  // Simulate network latency for all connections
  public simulateNetworkLatency(min: number, max: number): void {
    for (const connection of this.connections.values()) {
      const latency = Math.floor(Math.random() * (max - min + 1)) + min;
      connection.setConnectionDelay(latency);
    }
  }
  
  // Clear all data
  public reset(): void {
    this.boards = {};
    this.connections.clear();
    
    // Clear event handlers
    for (const eventType in this.eventHandlers) {
      this.eventHandlers[eventType] = [];
    }
  }
}

// Create a test instance of the collaboration server
export function createTestCollaborationServer(): MockCollaborationServer {
  return new MockCollaborationServer();
}

// Create a test user for collaboration tests
export function createTestUser(id: string = `user-${Date.now()}`, name: string = `User ${id}`): BoardUser {
  return createMockBoardUser(id, name, getRandomColor());
}

// Create a test board for collaboration tests
export function createTestBoard(id: string = `board-${Date.now()}`, name: string = `Board ${id}`): BoardState {
  return createMockBoardState(id, name);
}

// Helper to generate random colors
function getRandomColor(): string {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5',
    '#33FFF5', '#F5FF33', '#FF5733', '#C70039',
    '#900C3F', '#581845', '#FFC300', '#DAF7A6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
