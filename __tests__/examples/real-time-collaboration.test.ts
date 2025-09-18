/**
 * Example test for real-time collaboration
 * 
 * This test demonstrates how to use the real-time testing utilities
 * to test collaboration features in Whizboard.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { setupRealTimeTests, TimeController } from '../utils/real-time-test-utils';
import { 
  createTestCollaborationServer, 
  createTestUser, 
  createTestBoard,
  createMockBoardElement
} from '../utils/collaboration-test-helpers';

// Mock the hooks and components we'll test
vi.mock('@/hooks/useBoardRealTime', () => {
  return {
    default: vi.fn(() => ({
      isConnected: true,
      users: {},
      sendCursorPosition: vi.fn(),
      createElement: vi.fn(),
      updateElement: vi.fn(),
      deleteElement: vi.fn(),
    })),
    __esModule: true,
  };
});

// Import the mocked hook
import useBoardRealTime from '@/hooks/useBoardRealTime';

// Example component that uses the real-time hook
function CollaborationComponent({ boardId, userId }: { boardId: string; userId: string }) {
  const { 
    isConnected, 
    users, 
    sendCursorPosition, 
    createElement, 
    updateElement, 
    deleteElement 
  } = useBoardRealTime({ boardId, userId });

  const handleMouseMove = (e: React.MouseEvent) => {
    sendCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCreateElement = () => {
    createElement({
      id: `element-${Date.now()}`,
      type: 'sticky-note',
      position: { x: 100, y: 100 },
      content: 'New note',
    });
  };

  return (
    <div data-testid="collaboration-area" onMouseMove={handleMouseMove}>
      <div data-testid="connection-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="user-count">
        {Object.keys(users).length} users online
      </div>
      <button data-testid="create-element" onClick={handleCreateElement}>
        Create Element
      </button>
    </div>
  );
}

describe('Real-Time Collaboration Example', () => {
  // Set up test environment
  const rtTestUtils = setupRealTimeTests();
  const mockServer = createTestCollaborationServer();
  const timeController = new TimeController();
  
  // Test data
  const testBoard = createTestBoard('test-board-1', 'Test Board');
  const testUser1 = createTestUser('test-user-1', 'User 1');
  const testUser2 = createTestUser('test-user-2', 'User 2');
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Enable time controller
    timeController.enable();
    
    // Set up test board and users
    mockServer.reset();
    mockServer.addBoard(testBoard);
    mockServer.addUserToBoard(testBoard.id, testUser1);
    mockServer.addUserToBoard(testBoard.id, testUser2);
    
    // Mock the useBoardRealTime hook implementation
    (useBoardRealTime as any).mockImplementation(({ boardId, userId }) => {
      return {
        isConnected: true,
        users: {
          [testUser1.id]: testUser1,
          [testUser2.id]: testUser2,
        },
        sendCursorPosition: vi.fn((position) => {
          mockServer.updateCursorPosition(boardId, userId, position);
        }),
        createElement: vi.fn((element) => {
          mockServer.addElementToBoard(boardId, element, userId);
        }),
        updateElement: vi.fn((element) => {
          mockServer.updateElementOnBoard(boardId, element, userId);
        }),
        deleteElement: vi.fn((elementId) => {
          mockServer.removeElementFromBoard(boardId, elementId, userId);
        }),
      };
    });
  });
  
  afterEach(() => {
    // Disable time controller
    timeController.disable();
  });

  it('should render connection status and user count', () => {
    render(
      <CollaborationComponent 
        boardId={testBoard.id} 
        userId={testUser1.id} 
      />
    );
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    expect(screen.getByTestId('user-count')).toHaveTextContent('2 users online');
  });

  it('should send cursor position on mouse move', () => {
    // Set up spy on mockServer
    const spy = vi.spyOn(mockServer, 'updateCursorPosition');
    
    render(
      <CollaborationComponent 
        boardId={testBoard.id} 
        userId={testUser1.id} 
      />
    );
    
    // Simulate mouse move
    fireEvent.mouseMove(screen.getByTestId('collaboration-area'), {
      clientX: 100,
      clientY: 200,
    });
    
    // Check if the cursor position was updated
    expect(spy).toHaveBeenCalledWith(
      testBoard.id,
      testUser1.id,
      { x: 100, y: 200 }
    );
  });

  it('should create an element when button is clicked', () => {
    // Set up spy on mockServer
    const spy = vi.spyOn(mockServer, 'addElementToBoard');
    
    render(
      <CollaborationComponent 
        boardId={testBoard.id} 
        userId={testUser1.id} 
      />
    );
    
    // Mock Date.now to return a consistent value
    const originalDateNow = Date.now;
    Date.now = vi.fn(() => 1234567890);
    
    // Click the create element button
    fireEvent.click(screen.getByTestId('create-element'));
    
    // Restore Date.now
    Date.now = originalDateNow;
    
    // Check if an element was created
    expect(spy).toHaveBeenCalledWith(
      testBoard.id,
      expect.objectContaining({
        id: 'element-1234567890',
        type: 'sticky-note',
      }),
      testUser1.id
    );
  });

  it('should handle user disconnection and reconnection', () => {
    // Mock implementation to track connection state
    let isConnected = true;
    (useBoardRealTime as any).mockImplementation(({ boardId, userId }) => {
      return {
        isConnected,
        users: {
          [testUser1.id]: testUser1,
          [testUser2.id]: testUser2,
        },
        sendCursorPosition: vi.fn(),
        createElement: vi.fn(),
        updateElement: vi.fn(),
        deleteElement: vi.fn(),
      };
    });
    
    const { rerender } = render(
      <CollaborationComponent 
        boardId={testBoard.id} 
        userId={testUser1.id} 
      />
    );
    
    // Initially connected
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    
    // Simulate disconnection
    act(() => {
      isConnected = false;
      rerender(
        <CollaborationComponent 
          boardId={testBoard.id} 
          userId={testUser1.id} 
        />
      );
    });
    
    // Now disconnected
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    
    // Simulate reconnection
    act(() => {
      isConnected = true;
      rerender(
        <CollaborationComponent 
          boardId={testBoard.id} 
          userId={testUser1.id} 
        />
      );
    });
    
    // Connected again
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
  });

  it('should handle adding and removing users', () => {
    // Set up users object that we can modify
    const users = {
      [testUser1.id]: testUser1,
      [testUser2.id]: testUser2,
    };
    
    // Mock implementation to use our users object
    (useBoardRealTime as any).mockImplementation(() => {
      return {
        isConnected: true,
        users,
        sendCursorPosition: vi.fn(),
        createElement: vi.fn(),
        updateElement: vi.fn(),
        deleteElement: vi.fn(),
      };
    });
    
    const { rerender } = render(
      <CollaborationComponent 
        boardId={testBoard.id} 
        userId={testUser1.id} 
      />
    );
    
    // Initially 2 users
    expect(screen.getByTestId('user-count')).toHaveTextContent('2 users online');
    
    // Add a new user
    act(() => {
      const testUser3 = createTestUser('test-user-3', 'User 3');
      users[testUser3.id] = testUser3;
      rerender(
        <CollaborationComponent 
          boardId={testBoard.id} 
          userId={testUser1.id} 
        />
      );
    });
    
    // Now 3 users
    expect(screen.getByTestId('user-count')).toHaveTextContent('3 users online');
    
    // Remove a user
    act(() => {
      delete users[testUser2.id];
      rerender(
        <CollaborationComponent 
          boardId={testBoard.id} 
          userId={testUser1.id} 
        />
      );
    });
    
    // Now 2 users again
    expect(screen.getByTestId('user-count')).toHaveTextContent('2 users online');
  });

  it('should handle time-based events correctly', () => {
    // Create a component that updates based on time
    function TimeBasedComponent() {
      const [counter, setCounter] = React.useState(0);
      
      React.useEffect(() => {
        const intervalId = setInterval(() => {
          setCounter(prev => prev + 1);
        }, 1000);
        
        return () => clearInterval(intervalId);
      }, []);
      
      return <div data-testid="counter">{counter}</div>;
    }
    
    render(<TimeBasedComponent />);
    
    // Initially the counter is 0
    expect(screen.getByTestId('counter')).toHaveTextContent('0');
    
    // Advance time by 1 second
    act(() => {
      timeController.advanceTime(1000);
    });
    
    // Counter should be 1
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
    
    // Advance time by 3 more seconds
    act(() => {
      timeController.advanceTime(3000);
    });
    
    // Counter should be 4
    expect(screen.getByTestId('counter')).toHaveTextContent('4');
  });
});
