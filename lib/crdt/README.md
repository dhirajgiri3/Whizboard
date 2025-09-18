# Simplified CRDT Implementation

A clean, optimized CRDT (Conflict-free Replicated Data Types) implementation for collaborative editing in Whizboard.

## Features

- ✅ **Real-time collaboration** via WebSocket
- ✅ **Offline support** with IndexedDB persistence
- ✅ **Conflict-free editing** with automatic merge resolution
- ✅ **Simple API** - one unified interface for all elements
- ✅ **TypeScript support** - fully typed
- ✅ **React integration** - hooks and context providers

## Quick Start

### 1. Basic Usage

```typescript
import { CRDTCore } from './lib/crdt';

const crdt = new CRDTCore({
  boardId: 'my-board-123',
  userId: 'user-456',
  enableOffline: true
});

// Add an element
crdt.setElement({
  id: 'element-1',
  type: 'sticky-note',
  x: 100,
  y: 200,
  width: 200,
  height: 100,
  data: { text: 'Hello World!', color: 'yellow' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user-456'
});

// Listen for changes
crdt.onElementsChange(() => {
  const elements = crdt.getAllElements();
  console.log('Elements updated:', elements);
});
```

### 2. React Integration

```tsx
import { CRDTProvider, useCRDTContext } from './lib/crdt/CRDTProvider';

function App() {
  return (
    <CRDTProvider config={{ boardId: 'board-123', userId: 'user-456' }}>
      <BoardCanvas />
    </CRDTProvider>
  );
}

function BoardCanvas() {
  const { elements, setElement, removeElement, isConnected } = useCRDTContext();

  const addStickyNote = () => {
    setElement({
      id: `note-${Date.now()}`,
      type: 'sticky-note',
      x: Math.random() * 500,
      y: Math.random() * 500,
      width: 200,
      height: 100,
      data: { text: 'New note', color: 'yellow' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'user-456'
    });
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Offline'}</div>
      <button onClick={addStickyNote}>Add Sticky Note</button>
      {elements.map(element => (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height
          }}
        >
          {element.data.text}
        </div>
      ))}
    </div>
  );
}
```

## Element Types

All elements follow the same unified structure:

```typescript
interface BoardElement {
  id: string;
  type: 'line' | 'sticky-note' | 'frame' | 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: Record<string, any>; // Element-specific data
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}
```

### Example Element Types

```typescript
// Sticky Note
{
  id: 'note-1',
  type: 'sticky-note',
  x: 100, y: 100,
  width: 200, height: 100,
  data: { text: 'Hello', color: 'yellow' },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user-123'
}

// Drawing Line
{
  id: 'line-1',
  type: 'line',
  x: 0, y: 0,
  data: {
    points: [10, 20, 30, 40],
    strokeWidth: 2,
    color: '#000'
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user-123'
}

// Shape
{
  id: 'shape-1',
  type: 'shape',
  x: 50, y: 50,
  width: 100, height: 100,
  data: {
    shapeType: 'rectangle',
    fill: '#blue',
    stroke: '#black'
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user-123'
}
```

## Performance

### Before Optimization
- **4,241 lines** across 12 files
- Complex inheritance hierarchies
- Redundant spatial indexing
- Custom networking layers

### After Optimization
- **552 lines** across 5 files (87% reduction!)
- Simple, unified API
- Leverages native Yjs capabilities
- Clean separation of concerns

## Migration Guide

If you have existing code using the old CRDT implementation:

```typescript
// Old way
const operations = new CRDTBoardOperations(document);
operations.addLine(lineData);

// New way
document.setElement({
  id: lineData.id,
  type: 'line',
  x: 0, y: 0,
  data: lineData,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: userId
});
```

The new implementation is much simpler and more maintainable while providing all the same functionality.