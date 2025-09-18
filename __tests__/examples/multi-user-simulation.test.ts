/**
 * Example test for multi-user simulation
 * 
 * This test demonstrates how to use the multi-user simulator
 * to test complex collaboration scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createMultiUserSimulator,
  createRealisticScenario,
  createRandomCursorMovements,
  createStickyNoteAction,
  createTextElementAction,
  SimulatedUser
} from '../utils/multi-user-simulator';
import { 
  createTestCollaborationServer,
  createTestBoard,
  createTestUser
} from '../utils/collaboration-test-helpers';
import { setupRealTimeTests } from '../utils/real-time-test-utils';

describe('Multi-User Simulation Example', () => {
  // Set up test environment
  const rtTestUtils = setupRealTimeTests();
  const mockServer = createTestCollaborationServer();
  
  // Test data
  const testBoard = createTestBoard('test-board-1', 'Test Board');
  const testUser1 = createTestUser('test-user-1', 'User 1');
  const testUser2 = createTestUser('test-user-2', 'User 2');
  const testUser3 = createTestUser('test-user-3', 'User 3');
  
  // Create simulator
  const simulator = createMultiUserSimulator(testBoard.id);
  
  beforeEach(() => {
    // Reset mocks and simulator
    vi.resetAllMocks();
    simulator.reset();
    
    // Set up test board and server
    mockServer.reset();
    mockServer.addBoard(testBoard);
    
    // Add users to simulator
    simulator.addUser(testUser1);
    simulator.addUser(testUser2);
    simulator.addUser(testUser3);
  });
  
  afterEach(() => {
    // Stop any running simulations
    simulator.stop();
  });

  it('should connect multiple users to a board', () => {
    // Set up spies
    const spy = vi.fn();
    mockServer.on('user_joined', spy);
    
    // Connect all users
    simulator.connectAllUsers();
    
    // Wait for connections to establish
    vi.advanceTimersByTime(100);
    
    // Check that all users connected
    expect(spy).toHaveBeenCalledTimes(3);
    
    // Check that users are in the correct state
    const users = simulator.getUsers();
    users.forEach(user => {
      expect(user.isConnected).toBe(true);
    });
  });

  it('should simulate cursor movements', () => {
    // Set up spy
    const spy = vi.fn();
    mockServer.on('cursor_moved', spy);
    
    // Get a user
    const user = simulator.getUser(testUser1.id) as SimulatedUser;
    
    // Connect user
    user.connect();
    vi.advanceTimersByTime(100);
    
    // Perform cursor movement action
    user.performAction({
      type: 'move_cursor',
      data: { x: 100, y: 200 },
    });
    
    // Check that cursor movement was sent
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cursor_moved',
        boardId: testBoard.id,
        userId: testUser1.id,
        data: expect.objectContaining({
          position: { x: 100, y: 200 },
        }),
      })
    );
    
    // Check user's current position
    expect(user.currentPosition).toEqual({ x: 100, y: 200 });
  });

  it('should simulate element creation', () => {
    // Set up spy
    const spy = vi.fn();
    mockServer.on('element_created', spy);
    
    // Get a user
    const user = simulator.getUser(testUser1.id) as SimulatedUser;
    
    // Connect user
    user.connect();
    vi.advanceTimersByTime(100);
    
    // Perform element creation action
    user.performAction(createStickyNoteAction(
      { x: 100, y: 200 },
      'Test Note',
      '#FFFF88'
    ));
    
    // Check that element creation was sent
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'element_created',
        boardId: testBoard.id,
        userId: testUser1.id,
        data: expect.objectContaining({
          element: expect.objectContaining({
            type: 'sticky-note',
            position: { x: 100, y: 200 },
            content: 'Test Note',
            color: '#FFFF88',
          }),
        }),
      })
    );
  });

  it('should run a simple scenario with multiple users', async () => {
    // Set up spies
    const cursorSpy = vi.fn();
    const elementSpy = vi.fn();
    mockServer.on('cursor_moved', cursorSpy);
    mockServer.on('element_created', elementSpy);
    
    // Create a simple scenario
    const scenario = {
      name: 'Simple Test Scenario',
      description: 'A simple test scenario with multiple users',
      duration: 1000, // 1 second
      userActions: {
        [testUser1.id]: [
          { type: 'move_cursor', data: { x: 100, y: 100 }, delay: 100 },
          createStickyNoteAction({ x: 150, y: 150 }, 'Note from User 1', '#FFFF88', 300),
          { type: 'move_cursor', data: { x: 200, y: 200 }, delay: 500 },
        ],
        [testUser2.id]: [
          { type: 'move_cursor', data: { x: 300, y: 300 }, delay: 200 },
          createTextElementAction({ x: 350, y: 350 }, 'Text from User 2', 16, 400),
          { type: 'move_cursor', data: { x: 400, y: 400 }, delay: 600 },
        ],
        [testUser3.id]: [
          { type: 'move_cursor', data: { x: 500, y: 500 }, delay: 300 },
          { type: 'move_cursor', data: { x: 600, y: 600 }, delay: 700 },
        ],
      },
    };
    
    // Create a promise that resolves when the scenario completes
    const completionPromise = new Promise<void>((resolve) => {
      simulator.onComplete(() => {
        resolve();
      });
    });
    
    // Run the scenario
    simulator.runScenario(scenario);
    
    // Advance time to complete the scenario
    vi.advanceTimersByTime(scenario.duration + 100);
    
    // Wait for the scenario to complete
    await completionPromise;
    
    // Check that cursor movements were sent
    expect(cursorSpy).toHaveBeenCalledTimes(5);
    
    // Check that elements were created
    expect(elementSpy).toHaveBeenCalledTimes(2);
    
    // Check specific element creations
    expect(elementSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'element_created',
        boardId: testBoard.id,
        userId: testUser1.id,
        data: expect.objectContaining({
          element: expect.objectContaining({
            type: 'sticky-note',
            content: 'Note from User 1',
          }),
        }),
      })
    );
    
    expect(elementSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'element_created',
        boardId: testBoard.id,
        userId: testUser2.id,
        data: expect.objectContaining({
          element: expect.objectContaining({
            type: 'text',
            content: 'Text from User 2',
          }),
        }),
      })
    );
  });

  it('should run a realistic scenario with random actions', async () => {
    // Set up spies
    const cursorSpy = vi.fn();
    const elementSpy = vi.fn();
    mockServer.on('cursor_moved', cursorSpy);
    mockServer.on('element_created', elementSpy);
    
    // Create a realistic scenario
    const scenario = createRealisticScenario(
      'Realistic Test Scenario',
      'A realistic scenario with random user actions',
      [testUser1.id, testUser2.id, testUser3.id],
      2000 // 2 seconds
    );
    
    // Create a promise that resolves when the scenario completes
    const completionPromise = new Promise<void>((resolve) => {
      simulator.onComplete(() => {
        resolve();
      });
    });
    
    // Run the scenario
    simulator.runScenario(scenario);
    
    // Advance time to complete the scenario
    vi.advanceTimersByTime(scenario.duration + 100);
    
    // Wait for the scenario to complete
    await completionPromise;
    
    // Check that actions were performed
    expect(cursorSpy).toHaveBeenCalled();
    
    // Some elements may have been created (depends on the random scenario)
    // We don't assert on the exact number since it's random
    console.log(`Cursor movements: ${cursorSpy.mock.calls.length}`);
    console.log(`Elements created: ${elementSpy.mock.calls.length}`);
  });

  it('should handle user disconnection and reconnection', () => {
    // Set up spies
    const joinSpy = vi.fn();
    const leaveSpy = vi.fn();
    mockServer.on('user_joined', joinSpy);
    mockServer.on('user_left', leaveSpy);
    
    // Get a user
    const user = simulator.getUser(testUser1.id) as SimulatedUser;
    
    // Connect user
    user.connect();
    vi.advanceTimersByTime(100);
    
    // Check that user joined
    expect(joinSpy).toHaveBeenCalledTimes(1);
    expect(user.isConnected).toBe(true);
    
    // Disconnect user
    user.disconnect();
    vi.advanceTimersByTime(100);
    
    // Check that user left
    expect(leaveSpy).toHaveBeenCalledTimes(1);
    expect(user.isConnected).toBe(false);
    
    // Reconnect user
    user.connect();
    vi.advanceTimersByTime(100);
    
    // Check that user joined again
    expect(joinSpy).toHaveBeenCalledTimes(2);
    expect(user.isConnected).toBe(true);
  });

  it('should handle concurrent element creation and updates', () => {
    // Set up spies
    const createSpy = vi.fn();
    const updateSpy = vi.fn();
    mockServer.on('element_created', createSpy);
    mockServer.on('element_updated', updateSpy);
    
    // Get users
    const user1 = simulator.getUser(testUser1.id) as SimulatedUser;
    const user2 = simulator.getUser(testUser2.id) as SimulatedUser;
    
    // Connect users
    user1.connect();
    user2.connect();
    vi.advanceTimersByTime(100);
    
    // User 1 creates an element
    const elementId = 'test-element-1';
    user1.performAction({
      type: 'create_element',
      data: {
        id: elementId,
        type: 'sticky-note',
        position: { x: 100, y: 100 },
        content: 'Original Note',
        color: '#FFFF88',
      },
    });
    
    // Wait for the element to be created
    vi.advanceTimersByTime(100);
    
    // Check that element was created
    expect(createSpy).toHaveBeenCalledTimes(1);
    
    // User 2 updates the element
    user2.performAction({
      type: 'update_element',
      data: {
        id: elementId,
        content: 'Updated Note',
        color: '#88FFFF',
      },
    });
    
    // Wait for the element to be updated
    vi.advanceTimersByTime(100);
    
    // Check that element was updated
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'element_updated',
        boardId: testBoard.id,
        userId: testUser2.id,
        data: expect.objectContaining({
          element: expect.objectContaining({
            id: elementId,
            content: 'Updated Note',
            color: '#88FFFF',
          }),
        }),
      })
    );
  });
});
