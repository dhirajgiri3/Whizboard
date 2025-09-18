/**
 * Multi-User Simulator
 * 
 * This module provides tools for simulating multiple users interacting with
 * a whiteboard in a controlled test environment.
 */

import { MockWebSocket } from './real-time-test-utils';
import { 
  createTestUser, 
  BoardUser, 
  BoardElement,
  BoardState
} from './collaboration-test-helpers';

// Types for simulated user actions
export type UserActionType = 
  | 'move_cursor'
  | 'create_element'
  | 'update_element'
  | 'delete_element'
  | 'join_board'
  | 'leave_board'
  | 'idle';

export interface UserAction {
  type: UserActionType;
  data?: any;
  delay?: number; // Delay in ms before performing the action
}

// Types for simulation scenarios
export interface SimulationScenario {
  name: string;
  description: string;
  duration: number; // Total duration in ms
  userActions: Record<string, UserAction[]>; // Map of user IDs to their actions
}

// Simulated user class
export class SimulatedUser {
  public user: BoardUser;
  public connection: MockWebSocket | null = null;
  public isConnected: boolean = false;
  public currentPosition: { x: number; y: number } = { x: 0, y: 0 };
  public elements: Record<string, BoardElement> = {};
  
  private boardId: string;
  private actions: UserAction[] = [];
  private currentActionIndex: number = 0;
  private onMessageCallback: ((message: any) => void) | null = null;
  
  constructor(user: BoardUser, boardId: string) {
    this.user = user;
    this.boardId = boardId;
  }
  
  // Connect to the board
  public connect(): void {
    if (this.isConnected) return;
    
    this.connection = new MockWebSocket(`wss://example.com/api/board/${this.boardId}/ws`);
    
    // Set up event listeners
    this.connection.addEventListener('open', () => {
      this.isConnected = true;
      this.sendMessage({
        type: 'join_board',
        boardId: this.boardId,
        userId: this.user.id,
        timestamp: Date.now(),
      });
    });
    
    this.connection.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleServerMessage(message);
      } catch (error) {
        console.error('Error handling server message:', error);
      }
    });
    
    this.connection.addEventListener('close', () => {
      this.isConnected = false;
    });
  }
  
  // Disconnect from the board
  public disconnect(): void {
    if (!this.isConnected || !this.connection) return;
    
    this.sendMessage({
      type: 'leave_board',
      boardId: this.boardId,
      userId: this.user.id,
      timestamp: Date.now(),
    });
    
    this.connection.close();
    this.isConnected = false;
  }
  
  // Send a message to the server
  public sendMessage(message: any): void {
    if (!this.isConnected || !this.connection) return;
    
    this.connection.send(JSON.stringify(message));
  }
  
  // Handle a message from the server
  private handleServerMessage(message: any): void {
    if (!message.type) return;
    
    // Update local state based on the message
    switch (message.type) {
      case 'board_sync':
        if (message.data?.board) {
          this.elements = { ...message.data.board.elements };
        }
        break;
        
      case 'element_created':
        if (message.data?.element) {
          this.elements[message.data.element.id] = message.data.element;
        }
        break;
        
      case 'element_updated':
        if (message.data?.element) {
          this.elements[message.data.element.id] = {
            ...this.elements[message.data.element.id],
            ...message.data.element,
          };
        }
        break;
        
      case 'element_deleted':
        if (message.data?.elementId) {
          delete this.elements[message.data.elementId];
        }
        break;
    }
    
    // Call the message callback if set
    if (this.onMessageCallback) {
      this.onMessageCallback(message);
    }
  }
  
  // Set actions for this user
  public setActions(actions: UserAction[]): void {
    this.actions = [...actions];
    this.currentActionIndex = 0;
  }
  
  // Get the next action to perform
  public getNextAction(): UserAction | null {
    if (this.currentActionIndex >= this.actions.length) {
      return null;
    }
    
    return this.actions[this.currentActionIndex++];
  }
  
  // Perform an action
  public performAction(action: UserAction): void {
    if (!this.isConnected) return;
    
    switch (action.type) {
      case 'move_cursor':
        this.moveCursor(action.data);
        break;
        
      case 'create_element':
        this.createElement(action.data);
        break;
        
      case 'update_element':
        this.updateElement(action.data);
        break;
        
      case 'delete_element':
        this.deleteElement(action.data);
        break;
        
      case 'leave_board':
        this.disconnect();
        break;
        
      case 'idle':
        // Do nothing
        break;
    }
  }
  
  // Move the cursor
  private moveCursor(position: { x: number; y: number }): void {
    this.currentPosition = { ...position };
    
    this.sendMessage({
      type: 'cursor_moved',
      boardId: this.boardId,
      userId: this.user.id,
      timestamp: Date.now(),
      position: this.currentPosition,
    });
  }
  
  // Create an element
  private createElement(element: BoardElement): void {
    this.sendMessage({
      type: 'element_created',
      boardId: this.boardId,
      userId: this.user.id,
      timestamp: Date.now(),
      element: {
        ...element,
        id: element.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    });
  }
  
  // Update an element
  private updateElement(element: BoardElement): void {
    if (!element.id || !this.elements[element.id]) return;
    
    this.sendMessage({
      type: 'element_updated',
      boardId: this.boardId,
      userId: this.user.id,
      timestamp: Date.now(),
      element: {
        ...this.elements[element.id],
        ...element,
      },
    });
  }
  
  // Delete an element
  private deleteElement(elementId: string): void {
    if (!this.elements[elementId]) return;
    
    this.sendMessage({
      type: 'element_deleted',
      boardId: this.boardId,
      userId: this.user.id,
      timestamp: Date.now(),
      elementId,
    });
  }
  
  // Set a callback for received messages
  public onMessage(callback: (message: any) => void): void {
    this.onMessageCallback = callback;
  }
  
  // Reset the user's state
  public reset(): void {
    this.disconnect();
    this.elements = {};
    this.currentPosition = { x: 0, y: 0 };
    this.actions = [];
    this.currentActionIndex = 0;
    this.onMessageCallback = null;
  }
}

// Multi-user simulator class
export class MultiUserSimulator {
  private users: Record<string, SimulatedUser> = {};
  private boardId: string;
  private timeoutIds: NodeJS.Timeout[] = [];
  private isRunning: boolean = false;
  private onCompleteCallback: (() => void) | null = null;
  
  constructor(boardId: string) {
    this.boardId = boardId;
  }
  
  // Add a user to the simulation
  public addUser(user: BoardUser | string): SimulatedUser {
    const userObj = typeof user === 'string' ? createTestUser(user) : user;
    const simulatedUser = new SimulatedUser(userObj, this.boardId);
    this.users[userObj.id] = simulatedUser;
    return simulatedUser;
  }
  
  // Get a user by ID
  public getUser(userId: string): SimulatedUser | null {
    return this.users[userId] || null;
  }
  
  // Get all users
  public getUsers(): SimulatedUser[] {
    return Object.values(this.users);
  }
  
  // Connect all users
  public connectAllUsers(): void {
    Object.values(this.users).forEach(user => user.connect());
  }
  
  // Disconnect all users
  public disconnectAllUsers(): void {
    Object.values(this.users).forEach(user => user.disconnect());
  }
  
  // Run a simulation scenario
  public runScenario(scenario: SimulationScenario): void {
    if (this.isRunning) {
      throw new Error('Simulation is already running');
    }
    
    this.isRunning = true;
    
    // Set up user actions
    Object.entries(scenario.userActions).forEach(([userId, actions]) => {
      const user = this.getUser(userId);
      if (user) {
        user.setActions(actions);
      }
    });
    
    // Connect all users
    this.connectAllUsers();
    
    // Schedule actions
    Object.values(this.users).forEach(user => {
      this.scheduleNextAction(user);
    });
    
    // Schedule completion callback
    this.timeoutIds.push(setTimeout(() => {
      this.isRunning = false;
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }, scenario.duration));
  }
  
  // Schedule the next action for a user
  private scheduleNextAction(user: SimulatedUser): void {
    const action = user.getNextAction();
    if (!action) return;
    
    const delay = action.delay || 0;
    
    this.timeoutIds.push(setTimeout(() => {
      user.performAction(action);
      this.scheduleNextAction(user);
    }, delay));
  }
  
  // Stop the simulation
  public stop(): void {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
    this.isRunning = false;
  }
  
  // Reset the simulation
  public reset(): void {
    this.stop();
    Object.values(this.users).forEach(user => user.reset());
  }
  
  // Set a callback for when the simulation completes
  public onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }
  
  // Check if the simulation is running
  public isSimulationRunning(): boolean {
    return this.isRunning;
  }
}

// Helper function to create a multi-user simulator
export function createMultiUserSimulator(boardId: string): MultiUserSimulator {
  return new MultiUserSimulator(boardId);
}

// Helper function to create a random cursor movement action
export function createRandomCursorMovement(
  minX: number = 0,
  maxX: number = 1000,
  minY: number = 0,
  maxY: number = 1000,
  delay: number = 100
): UserAction {
  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
  
  return {
    type: 'move_cursor',
    data: { x, y },
    delay,
  };
}

// Helper function to create a series of random cursor movements
export function createRandomCursorMovements(
  count: number,
  minDelay: number = 100,
  maxDelay: number = 500
): UserAction[] {
  const actions: UserAction[] = [];
  
  for (let i = 0; i < count; i++) {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    actions.push(createRandomCursorMovement(0, 1000, 0, 1000, delay));
  }
  
  return actions;
}

// Helper function to create a sticky note element action
export function createStickyNoteAction(
  position: { x: number; y: number },
  content: string = 'New Note',
  color: string = '#FFFF88',
  delay: number = 0
): UserAction {
  return {
    type: 'create_element',
    data: {
      type: 'sticky-note',
      position,
      content,
      color,
      width: 200,
      height: 200,
    },
    delay,
  };
}

// Helper function to create a text element action
export function createTextElementAction(
  position: { x: number; y: number },
  text: string = 'New Text',
  fontSize: number = 16,
  delay: number = 0
): UserAction {
  return {
    type: 'create_element',
    data: {
      type: 'text',
      position,
      content: text,
      fontSize,
      fontFamily: 'Arial',
      color: '#000000',
    },
    delay,
  };
}

// Helper function to create a shape element action
export function createShapeElementAction(
  position: { x: number; y: number },
  shapeType: 'rectangle' | 'circle' | 'triangle' = 'rectangle',
  color: string = '#FF0000',
  delay: number = 0
): UserAction {
  return {
    type: 'create_element',
    data: {
      type: 'shape',
      shapeType,
      position,
      width: 100,
      height: 100,
      fill: color,
      stroke: '#000000',
      strokeWidth: 2,
    },
    delay,
  };
}

// Helper function to create a line element action
export function createLineElementAction(
  points: number[],
  color: string = '#000000',
  strokeWidth: number = 2,
  delay: number = 0
): UserAction {
  return {
    type: 'create_element',
    data: {
      type: 'line',
      points,
      stroke: color,
      strokeWidth,
    },
    delay,
  };
}

// Helper function to create a realistic simulation scenario
export function createRealisticScenario(
  name: string,
  description: string,
  userIds: string[],
  duration: number = 60000
): SimulationScenario {
  const userActions: Record<string, UserAction[]> = {};
  
  userIds.forEach(userId => {
    const actions: UserAction[] = [];
    
    // Initial delay
    let currentDelay = Math.floor(Math.random() * 2000);
    
    // Random cursor movements throughout the session
    const movementCount = Math.floor(duration / 1000) * 2; // 2 movements per second on average
    for (let i = 0; i < movementCount; i++) {
      currentDelay += Math.floor(Math.random() * 500) + 100;
      if (currentDelay > duration) break;
      
      actions.push(createRandomCursorMovement(0, 1000, 0, 1000, currentDelay));
    }
    
    // Add some element creations
    const elementCount = Math.floor(Math.random() * 5) + 1; // 1-5 elements
    for (let i = 0; i < elementCount; i++) {
      currentDelay = Math.floor(Math.random() * duration);
      
      const elementType = Math.floor(Math.random() * 4);
      switch (elementType) {
        case 0:
          actions.push(createStickyNoteAction(
            { x: Math.random() * 800, y: Math.random() * 600 },
            `Note from ${userId}`,
            ['#FFFF88', '#88FF88', '#8888FF', '#FF88FF'][Math.floor(Math.random() * 4)],
            currentDelay
          ));
          break;
          
        case 1:
          actions.push(createTextElementAction(
            { x: Math.random() * 800, y: Math.random() * 600 },
            `Text from ${userId}`,
            12 + Math.floor(Math.random() * 12),
            currentDelay
          ));
          break;
          
        case 2:
          actions.push(createShapeElementAction(
            { x: Math.random() * 800, y: Math.random() * 600 },
            ['rectangle', 'circle', 'triangle'][Math.floor(Math.random() * 3)] as any,
            ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][Math.floor(Math.random() * 4)],
            currentDelay
          ));
          break;
          
        case 3:
          const startX = Math.random() * 800;
          const startY = Math.random() * 600;
          const points = [
            startX, startY,
            startX + Math.random() * 200, startY + Math.random() * 200,
            startX + Math.random() * 200, startY + Math.random() * 200,
          ];
          actions.push(createLineElementAction(
            points,
            ['#000000', '#FF0000', '#00FF00', '#0000FF'][Math.floor(Math.random() * 4)],
            1 + Math.floor(Math.random() * 3),
            currentDelay
          ));
          break;
      }
    }
    
    // Sort actions by delay
    actions.sort((a, b) => (a.delay || 0) - (b.delay || 0));
    
    userActions[userId] = actions;
  });
  
  return {
    name,
    description,
    duration,
    userActions,
  };
}
