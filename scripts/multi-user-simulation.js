/**
 * Multi-User Simulation Script for Whizboard
 * 
 * This script simulates multiple users interacting with a whiteboard
 * to help test real-time collaboration features in a controlled environment.
 * 
 * Usage:
 *   node -r dotenv/config scripts/multi-user-simulation.js [options]
 * 
 * Options:
 *   --board-id=<id>     The ID of the board to test (required)
 *   --users=<number>    Number of simulated users (default: 3)
 *   --duration=<seconds> Duration of the simulation in seconds (default: 60)
 *   --delay=<ms>        Delay between actions in ms (default: 500)
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { program } = require('commander');

// Parse command line arguments
program
  .option('--board-id <id>', 'Board ID to test')
  .option('--users <number>', 'Number of simulated users', 3)
  .option('--duration <seconds>', 'Duration of simulation in seconds', 60)
  .option('--delay <ms>', 'Delay between actions in ms', 500)
  .parse(process.argv);

const options = program.opts();

if (!options.boardId) {
  console.error('Error: --board-id is required');
  process.exit(1);
}

// Configuration
const config = {
  boardId: options.boardId,
  userCount: parseInt(options.users, 10),
  duration: parseInt(options.duration, 10) * 1000,
  actionDelay: parseInt(options.delay, 10),
  wsEndpoint: `ws://localhost:3000/api/graphql/ws`,
};

console.log(`Starting multi-user simulation with the following configuration:`);
console.log(`- Board ID: ${config.boardId}`);
console.log(`- Simulated users: ${config.userCount}`);
console.log(`- Duration: ${config.duration / 1000} seconds`);
console.log(`- Action delay: ${config.actionDelay}ms`);
console.log('');

// User simulation class
class SimulatedUser {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
    this.ws = null;
    this.connected = false;
    this.cursorPosition = { x: 0, y: 0 };
    this.actionInterval = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(config.wsEndpoint);
      
      this.ws.on('open', () => {
        console.log(`[${this.username}] Connected to WebSocket server`);
        this.connected = true;
        
        // Send connection initialization message
        this.sendMessage({
          type: 'connection_init',
          payload: {
            boardId: config.boardId,
            userId: this.userId,
            username: this.username,
          },
        });
        
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data);
        // Handle incoming messages if needed
        // console.log(`[${this.username}] Received:`, message);
      });
      
      this.ws.on('error', (error) => {
        console.error(`[${this.username}] WebSocket error:`, error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log(`[${this.username}] Disconnected from WebSocket server`);
        this.connected = false;
      });
    });
  }

  disconnect() {
    if (this.actionInterval) {
      clearInterval(this.actionInterval);
      this.actionInterval = null;
    }
    
    if (this.connected && this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }

  sendMessage(message) {
    if (this.connected && this.ws) {
      this.ws.send(JSON.stringify(message));
    }
  }

  startSimulation() {
    // Simulate user actions at regular intervals
    this.actionInterval = setInterval(() => {
      this.performRandomAction();
    }, config.actionDelay);
  }

  performRandomAction() {
    // Generate random cursor movement
    this.cursorPosition = {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 600),
    };
    
    // Send cursor position update
    this.sendMessage({
      type: 'cursor_update',
      payload: {
        boardId: config.boardId,
        userId: this.userId,
        position: this.cursorPosition,
      },
    });
    
    // Randomly perform other actions (create elements, etc.)
    const actionType = Math.floor(Math.random() * 5);
    
    switch (actionType) {
      case 0:
        // Create sticky note
        this.createStickyNote();
        break;
      case 1:
        // Create text element
        this.createTextElement();
        break;
      case 2:
        // Draw line
        this.drawLine();
        break;
      case 3:
        // Create shape
        this.createShape();
        break;
      default:
        // Just move cursor
        break;
    }
  }

  createStickyNote() {
    const noteId = uuidv4();
    this.sendMessage({
      type: 'create_element',
      payload: {
        boardId: config.boardId,
        userId: this.userId,
        element: {
          id: noteId,
          type: 'sticky_note',
          position: this.cursorPosition,
          content: `Note from ${this.username}`,
          color: ['#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#F44336'][
            Math.floor(Math.random() * 5)
          ],
        },
      },
    });
  }

  createTextElement() {
    const textId = uuidv4();
    this.sendMessage({
      type: 'create_element',
      payload: {
        boardId: config.boardId,
        userId: this.userId,
        element: {
          id: textId,
          type: 'text',
          position: this.cursorPosition,
          content: `Text from ${this.username}`,
          fontSize: 16 + Math.floor(Math.random() * 10),
        },
      },
    });
  }

  drawLine() {
    const lineId = uuidv4();
    const startX = this.cursorPosition.x;
    const startY = this.cursorPosition.y;
    const points = [
      startX, startY,
      startX + Math.random() * 100, startY + Math.random() * 100,
      startX + Math.random() * 200, startY + Math.random() * 50,
    ];
    
    this.sendMessage({
      type: 'create_element',
      payload: {
        boardId: config.boardId,
        userId: this.userId,
        element: {
          id: lineId,
          type: 'line',
          points: points,
          stroke: ['#000000', '#FF0000', '#00FF00', '#0000FF'][
            Math.floor(Math.random() * 4)
          ],
          strokeWidth: 2 + Math.floor(Math.random() * 3),
        },
      },
    });
  }

  createShape() {
    const shapeId = uuidv4();
    const shapeTypes = ['rectangle', 'circle', 'triangle'];
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    this.sendMessage({
      type: 'create_element',
      payload: {
        boardId: config.boardId,
        userId: this.userId,
        element: {
          id: shapeId,
          type: 'shape',
          shapeType: shapeType,
          position: this.cursorPosition,
          width: 50 + Math.floor(Math.random() * 100),
          height: 50 + Math.floor(Math.random() * 100),
          fill: ['#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#F44336'][
            Math.floor(Math.random() * 5)
          ],
          stroke: '#000000',
          strokeWidth: 2,
        },
      },
    });
  }
}

// Main simulation function
async function runSimulation() {
  console.log('Starting simulation...');
  
  // Create simulated users
  const users = [];
  for (let i = 0; i < config.userCount; i++) {
    const userId = `sim-user-${uuidv4()}`;
    const username = `SimUser${i + 1}`;
    users.push(new SimulatedUser(userId, username));
  }
  
  // Connect all users
  try {
    await Promise.all(users.map(user => user.connect()));
    console.log('All users connected successfully');
    
    // Start simulation for all users
    users.forEach(user => user.startSimulation());
    console.log('Simulation started');
    
    // Run for specified duration
    await new Promise(resolve => setTimeout(resolve, config.duration));
    
    // Disconnect all users
    users.forEach(user => user.disconnect());
    console.log('Simulation completed');
    
    // Print statistics
    console.log('\nSimulation Statistics:');
    console.log(`- Duration: ${config.duration / 1000} seconds`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Total actions: ~${Math.floor(config.duration / config.actionDelay) * users.length}`);
    
  } catch (error) {
    console.error('Simulation failed:', error);
  }
}

// Run the simulation
runSimulation();
