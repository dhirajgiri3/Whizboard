import SchemaBuilder from '@pothos/core';
import RelayPlugin from '@pothos/plugin-relay';
import { createPubSub, YogaInitialContext } from 'graphql-yoga';
import { User, Board, DrawingElement, BoardInvitation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '../database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '../logger';
import { Session } from 'next-auth';
import { EmailService } from '../email/sendgrid';

interface DrawingLineData {
  id: string;
  points: number[];
  tool: string;
  color: string;
  strokeWidth: number;
}

interface DrawingEventPayload {
  boardId: string;
  userId: string;
  userName: string;
  line: DrawingLineData;
  timestamp: number;
}

interface TextEventPayload {
  boardId: string;
  userId: string;
  userName: string;
  textElement: {
    id: string;
    type: 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    formatting: Record<string, unknown>;
    style: Record<string, unknown>;
    rotation: number;
    isEditing: boolean;
    isSelected: boolean;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    version: number;
  };
  timestamp: number;
}

export const pubSub = createPubSub<{
  boardUpdates: [boardId: string, payload: Board];
  userJoined: [boardId: string, payload: User];
  userLeft: [boardId: string, payload: { id: string }];
  cursorMovement: [boardId: string, payload: { x: number; y: number; userId: string; name: string }];
  collaboratorInvited: [boardId: string, payload: { boardId: string; inviteeEmail: string; inviterName: string }];
  collaboratorJoined: [boardId: string, payload: { boardId: string; collaborator: User; boardName: string }];
  invitationStatusChanged: [boardId: string, payload: { invitationId: string; status: string; email: string }];
  drawingStarted: [boardId: string, payload: DrawingEventPayload];
  drawingUpdated: [boardId: string, payload: DrawingEventPayload];
  drawingCompleted: [boardId: string, payload: DrawingEventPayload];
  elementAdded: [boardId: string, payload: { id: string; type: string; data: Record<string, unknown>; userId: string; timestamp: number }];
  elementUpdated: [boardId: string, payload: { id: string; type: string; data: Record<string, unknown>; userId: string; timestamp: number }];
  elementDeleted: [boardId: string, payload: { elementId: string; userId: string; timestamp: number }];
  textElementCreated: [boardId: string, payload: TextEventPayload];
  textElementUpdated: [boardId: string, payload: TextEventPayload];
  textElementDeleted: [boardId: string, payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }];
  textElementEditingStarted: [boardId: string, payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }];
  textElementEditingFinished: [boardId: string, payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }];
}>();

interface Context extends YogaInitialContext {
  pubSub: typeof pubSub;
  session: Session | null;
}

const builder = new SchemaBuilder<{
  Objects: { 
    User: User; 
    Board: Board; 
    DrawingElement: DrawingElement; 
    BoardAction: { type: string; data: string; timestamp: string; };
  };
  Context: Context;
}>({
  plugins: [RelayPlugin],
});

const UserRef = builder.objectRef<User>('User');
const DrawingElementRef = builder.objectRef<DrawingElement>('DrawingElement');
const BoardRef = builder.objectRef<Board>('Board');
const BoardActionRef = builder.objectRef<{ type: string; data: string; timestamp: string; }>('BoardAction');

builder.queryType({
  fields: (t) => ({
    hello: t.string({
      resolve: () => 'world',
    }),
    getBoard: t.field({
      type: BoardRef,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: async (_, { id }) => {
        logger.debug({ id }, 'getBoard query received');
        const db = await connectToDatabase();
        const board = await db.collection('boards').findOne({ _id: new ObjectId(id) });

        if (!board) {
          logger.error({ id }, 'Board not found');
          throw new Error(`Board with id ${id} not found`);
        }
        
        logger.info({ boardId: board._id }, 'Board retrieved successfully');
        return { ...board, id: board._id.toString() } as any;
      },
    }),
    myBoards: t.field({
        type: [BoardRef],
        resolve: async (_, __, { session }) => {
            if (!session?.user?.id) {
                throw new Error('You must be logged in to view your boards.');
            }
            const db = await connectToDatabase();
            const boards = await db.collection('boards').find({ createdBy: new ObjectId(session.user.id) }).toArray();
            return boards.map(board => ({ ...board, id: board._id.toString() })) as any;
        }
    })
  }),
});

builder.mutationType({
  fields: (t) => ({
    createBoard: t.field({
      type: BoardRef,
      args: {
        name: t.arg.string({ required: true }),
      },
      resolve: async (_, { name }, { session }) => {
        logger.debug({ name }, 'createBoard mutation received');
        if (!session?.user?.id) {
            throw new Error('Authentication required');
        }
        const db = await connectToDatabase();
        const newBoard = {
            name,
            elements: [],
            collaborators: [],
            createdBy: new ObjectId(session.user.id),
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublic: true,
        };
        const result = await db.collection('boards').insertOne(newBoard);
        logger.info({ boardId: result.insertedId }, 'New board created');
        return { ...newBoard, id: result.insertedId.toString(), createdBy: newBoard.createdBy.toString() };
      },
    }),
    updateBoard: t.field({
        type: BoardRef,
        args: {
            id: t.arg.string({ required: true }),
            name: t.arg.string({ required: true }),
        },
        resolve: async (_, { id, name }, { session }) => {
            if (!session?.user?.id) {
                throw new Error('Authentication required');
            }
            const db = await connectToDatabase();
            const board = await db.collection('boards').findOne({ _id: new ObjectId(id) });
            if (!board) {
                throw new Error('Board not found');
            }
            if (board.createdBy.toString() !== session.user.id) {
                throw new Error('You are not authorized to update this board');
            }
            await db.collection('boards').updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, updatedAt: new Date() } }
            );
            const updatedBoard = await db.collection('boards').findOne({ _id: new ObjectId(id) });
            if (!updatedBoard) {
                throw new Error('Board not found after update');
            }
            return { ...updatedBoard, id: updatedBoard._id.toString(), createdBy: updatedBoard.createdBy.toString() } as any;
        }
    }),
    deleteBoard: t.field({
        type: 'String',
        args: {
            id: t.arg.string({ required: true }),
        },
        resolve: async (_, { id }, { session }) => {
            if (!session?.user?.id) {
                throw new Error('Authentication required');
            }
            const db = await connectToDatabase();
            const board = await db.collection('boards').findOne({ _id: new ObjectId(id) });
            if (!board) {
                throw new Error('Board not found');
            }
            if (board.createdBy.toString() !== session.user.id) {
                throw new Error('You are not authorized to delete this board');
            }
            await db.collection('boards').deleteOne({ _id: new ObjectId(id) });
            return id;
        }
    }),
    addElement: t.field({
      type: DrawingElementRef,
      args: {
        boardId: t.arg.string({ required: true }),
        type: t.arg.string({ required: true }),
        data: t.arg.string({ required: true }),
      },
      resolve: async (_, { boardId, type, data }, { session }) => {
        logger.debug({ boardId, type }, 'addElement mutation received');
        if (!session?.user?.id) {
            throw new Error('Authentication required');
        }
        const db = await connectToDatabase();
        const parsedData = JSON.parse(data);
        
        const newElement: DrawingElement = {
          id: uuidv4(),
          type: parsedData.tool,
          data: parsedData,
          style: { stroke: parsedData.color, strokeWidth: parsedData.strokeWidth },
          createdBy: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await db.collection('boards').updateOne(
            { _id: new ObjectId(boardId) },
            { 
                $push: { elements: newElement as any },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.modifiedCount === 0) {
            logger.error({ boardId }, 'Failed to add element to board');
            throw new Error('Could not add element to board');
        }

        const updatedBoard = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        
        if (updatedBoard) {
            logger.info({ boardId }, 'Publishing board update');
            pubSub.publish('boardUpdates', boardId, { ...updatedBoard, id: updatedBoard._id.toString() } as any);
        }

        logger.info({ elementId: newElement.id, boardId }, 'Element added successfully');
        return newElement;
      },
    }),
    joinBoard: t.field({
      type: UserRef,
      args: {
        boardId: t.arg.string({ required: true }),
        name: t.arg.string({ required: true }),
      },
      resolve: (_, { boardId, name }) => {
        logger.debug({ boardId, name }, 'joinBoard mutation received');
        const user: User = { id: uuidv4(), name, email: `${name}@example.com`, isOnline: true };
        logger.info({ userId: user.id, boardId }, 'User joining board');
        pubSub.publish('userJoined', boardId, user);
        return user;
      },
    }),
    leaveBoard: t.field({
      type: 'String', // Returns the ID of the user who left
      args: {
        boardId: t.arg.string({ required: true }),
        userId: t.arg.string({ required: true }),
      },
      resolve: (_, { boardId, userId }) => {
        logger.debug({ boardId, userId }, 'leaveBoard mutation received');
        logger.info({ userId, boardId }, 'User leaving board');
        pubSub.publish('userLeft', boardId, { id: userId });
        return userId;
      },
    }),
    moveCursor: t.field({
      type: 'Boolean',
      args: {
        boardId: t.arg.string({ required: true }),
        userId: t.arg.string({ required: true }),
        name: t.arg.string({ required: true }),
        x: t.arg.int({ required: true }),
        y: t.arg.int({ required: true }),
      },
      resolve: (_, { boardId, userId, name, x, y }) => {
        // This resolver is very high frequency, so we use trace level
        logger.trace({ boardId, userId, x, y }, 'moveCursor mutation received');
        pubSub.publish('cursorMovement', boardId, { userId, name, x, y });
        return true;
      },
    }),
    addBoardAction: t.field({
      type: BoardRef,
      args: {
        boardId: t.arg.string({ required: true }),
        action: t.arg({ type: 'BoardActionInput', required: true }),
      },
      resolve: async (_, { boardId, action }, { session, pubSub }) => {
        if (!session?.user?.id) {
          throw new Error('Authentication required');
        }
        const db = await connectToDatabase();
        const board = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (!board) throw new Error('Board not found');

        // Remove redos if not at end
        let history = board.history || [];
        let historyIndex = typeof board.historyIndex === 'number' ? board.historyIndex : history.length - 1;
        history = history.slice(0, historyIndex + 1);
        // Add new action
        const newAction = { 
          type: (action as { type: string; data: string }).type,
          data: (action as { type: string; data: string }).data,
          timestamp: new Date().toISOString() 
        };
        history.push(newAction);
        historyIndex = history.length - 1;

        // Recompute elements from full history up to historyIndex
        let elements: DrawingElement[] = [];
        for (let i = 0; i <= historyIndex; i++) {
          const act = history[i];
          if (act.type === 'add') {
            const parsed = JSON.parse(act.data);
            elements.push({
              id: parsed.id || uuidv4(),
              type: parsed.tool || parsed.type,
              data: parsed,
              style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
              createdBy: session.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else if (act.type === 'update') {
            const parsed = JSON.parse(act.data);
            const elementIndex = elements.findIndex(el => el.id === parsed.id);
            if (elementIndex >= 0) {
              // Update existing element
              elements[elementIndex] = {
                ...elements[elementIndex],
                type: parsed.tool || parsed.type,
                data: parsed,
                style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
                updatedAt: new Date(),
              };
            }
          } else if (act.type === 'remove') {
            const removeId = JSON.parse(act.data).id;
            elements = elements.filter(el => el.id !== removeId);
          } else if (act.type === 'clear') {
            elements = [];
          }
        }

        await db.collection('boards').updateOne(
          { _id: new ObjectId(boardId) },
          {
            $set: {
              history,
              historyIndex,
              elements,
              updatedAt: new Date(),
            },
          }
        );
        const updatedBoard = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (updatedBoard) {
          const boardForPublish = { ...updatedBoard, id: updatedBoard._id.toString() } as unknown as Board;
          pubSub.publish('boardUpdates', boardId, boardForPublish);
        }
        return { ...updatedBoard!, id: updatedBoard!._id.toString() } as unknown as Board;
      },
    }),
    undoBoardAction: t.field({
      type: BoardRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      resolve: async (_, { boardId }, { session, pubSub }) => {
        if (!session?.user?.id) throw new Error('Authentication required');
        const db = await connectToDatabase();
        const board = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (!board) throw new Error('Board not found');
        const history = board.history || [];
        let historyIndex = typeof board.historyIndex === 'number' ? board.historyIndex : history.length - 1;
        
        // Check if undo is possible - can't undo if no history or already at beginning
        if (history.length === 0 || historyIndex < 0) {
          return { ...board, id: board._id.toString() } as unknown as Board;
        }
        
        historyIndex--;
        // Recompute elements up to historyIndex
        let elements: DrawingElement[] = [];
        
        // If historyIndex is -1, we're at the beginning (empty canvas)
        if (historyIndex >= 0) {
          for (let i = 0; i <= historyIndex; i++) {
            const act = history[i];
            if (act.type === 'add') {
              const parsed = JSON.parse(act.data);
              elements.push({
                id: parsed.id || uuidv4(),
                type: parsed.tool || parsed.type,
                data: parsed,
                style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
                createdBy: session.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } else if (act.type === 'update') {
              const parsed = JSON.parse(act.data);
              const elementIndex = elements.findIndex(el => el.id === parsed.id);
              if (elementIndex >= 0) {
                // Update existing element
                elements[elementIndex] = {
                  ...elements[elementIndex],
                  type: parsed.tool || parsed.type,
                  data: parsed,
                  style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
                  updatedAt: new Date(),
                };
              }
            } else if (act.type === 'remove') {
              const removeId = JSON.parse(act.data).id;
              elements = elements.filter(el => el.id !== removeId);
            } else if (act.type === 'clear') {
              elements = [];
            }
          }
        }
        
        await db.collection('boards').updateOne(
          { _id: new ObjectId(boardId) },
          {
            $set: {
              historyIndex,
              elements,
              updatedAt: new Date(),
            },
          }
        );
        const updatedBoard = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (updatedBoard) {
          // @ts-expect-error - Complex type conversion for GraphQL response
          pubSub.publish('boardUpdates', boardId, { ...updatedBoard, id: updatedBoard._id.toString() });
        }
        // @ts-expect-error - Complex type conversion for GraphQL response  
        return { ...updatedBoard, id: updatedBoard._id.toString() };
      },
    }),
    redoBoardAction: t.field({
      type: BoardRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      resolve: async (_, { boardId }, { session, pubSub }) => {
        if (!session?.user?.id) throw new Error('Authentication required');
        const db = await connectToDatabase();
        const board = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (!board) throw new Error('Board not found');
        const history = board.history || [];
        let historyIndex = typeof board.historyIndex === 'number' ? board.historyIndex : history.length - 1;
        
        // Check if redo is possible (not at the end)
        if (history.length === 0 || historyIndex >= history.length - 1) {
          return { ...board, id: board._id.toString() };
        }
        
        historyIndex++;
        // Recompute elements up to historyIndex
        let elements: DrawingElement[] = [];
        for (let i = 0; i <= historyIndex; i++) {
          const act = history[i];
          if (act.type === 'add') {
            const parsed = JSON.parse(act.data);
            elements.push({
              id: parsed.id || uuidv4(),
              type: parsed.tool || parsed.type,
              data: parsed,
              style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
              createdBy: session.user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else if (act.type === 'update') {
            const parsed = JSON.parse(act.data);
            const elementIndex = elements.findIndex(el => el.id === parsed.id);
            if (elementIndex >= 0) {
              // Update existing element
              elements[elementIndex] = {
                ...elements[elementIndex],
                type: parsed.tool || parsed.type,
                data: parsed,
                style: { stroke: parsed.color, strokeWidth: parsed.strokeWidth },
                updatedAt: new Date(),
              };
            }
          } else if (act.type === 'remove') {
            const removeId = JSON.parse(act.data).id;
            elements = elements.filter(el => el.id !== removeId);
          } else if (act.type === 'clear') {
            elements = [];
          }
        }
        await db.collection('boards').updateOne(
          { _id: new ObjectId(boardId) },
          {
            $set: {
              historyIndex,
              elements,
              updatedAt: new Date(),
            },
          }
        );
        const updatedBoard = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
        if (updatedBoard) {
          // @ts-expect-error - Complex type conversion for GraphQL response
          pubSub.publish('boardUpdates', boardId, { ...updatedBoard, id: updatedBoard._id.toString() });
        }
        // @ts-expect-error - Complex type conversion for GraphQL response  
        return { ...updatedBoard, id: updatedBoard._id.toString() };
      },
    }),
  }),
});

builder.objectType(UserRef, {
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    avatar: t.string({
      resolve: (user) => user.avatar || null,
      nullable: true,
    }),
    isOnline: t.boolean({
      resolve: (user) => user.isOnline || false,
    }),
  }),
});

builder.objectType(DrawingElementRef, {
  fields: (t) => ({
    id: t.exposeString('id'),
    type: t.exposeString('type'),
    data: t.string({
      resolve: (el) => JSON.stringify(el.data),
    }),
  }),
});

builder.objectType(BoardRef, {
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    isPublic: t.exposeBoolean('isPublic'),
    createdAt: t.string({
      resolve: (board) => board.createdAt.toISOString(),
    }),
    updatedAt: t.string({
      resolve: (board) => board.updatedAt.toISOString(),
    }),
    createdBy: t.string({
      resolve: (board) => board.createdBy.toString(),
    }),
    elements: t.field({
      type: [DrawingElementRef],
      resolve: (board) => board.elements,
    }),
    collaborators: t.field({
      type: [UserRef],
      resolve: (board) => board.collaborators,
    }),
    history: t.field({
      type: [BoardActionRef],
      resolve: (board) => (board.history || []).map(h => ({
        type: h.type,
        data: h.data,
        timestamp: h.timestamp
      })),
    }),
    historyIndex: t.int({
      resolve: (board) => board.historyIndex ?? 0,
    }),
  }),
});

builder.objectType(BoardActionRef, {
  fields: (t) => ({
    type: t.exposeString('type'),
    data: t.exposeString('data'),
    timestamp: t.exposeString('timestamp'),
  }),
});

// Define DrawingLineData object type
const DrawingLineDataRef = builder.objectRef<DrawingLineData>('DrawingLineData');
builder.objectType(DrawingLineDataRef, {
  fields: (t) => ({
    id: t.exposeString('id'),
    points: t.field({
      type: ['Float'],
      resolve: (line) => line.points,
    }),
    tool: t.exposeString('tool'),
    color: t.exposeString('color'),
    strokeWidth: t.exposeFloat('strokeWidth'),
  }),
});

// Define DrawingEventPayload object type
const DrawingEventPayloadRef = builder.objectRef<DrawingEventPayload>('DrawingEventPayload');
builder.objectType(DrawingEventPayloadRef, {
  fields: (t) => ({
    boardId: t.exposeString('boardId'),
    userId: t.exposeString('userId'),
    userName: t.exposeString('userName'),
    line: t.field({
      type: DrawingLineDataRef,
      resolve: (payload) => payload.line,
    }),
    timestamp: t.exposeFloat('timestamp'),
  }),
});

// Define TextEventPayload object type
const TextEventPayloadRef = builder.objectRef<TextEventPayload>('TextEventPayload');
builder.objectType(TextEventPayloadRef, {
  fields: (t) => ({
    boardId: t.exposeString('boardId'),
    userId: t.exposeString('userId'),
    userName: t.exposeString('userName'),
    textElement: t.field({
      type: builder.objectRef<TextEventPayload['textElement']>('TextElementData').implement({
        fields: (t) => ({
          id: t.exposeString('id'),
          type: t.exposeString('type'),
          x: t.exposeFloat('x'),
          y: t.exposeFloat('y'),
          width: t.exposeFloat('width'),
          height: t.exposeFloat('height'),
          text: t.exposeString('text'),
          formatting: t.string({
            resolve: (el) => JSON.stringify(el.formatting),
          }),
          style: t.string({
            resolve: (el) => JSON.stringify(el.style),
          }),
          rotation: t.exposeFloat('rotation'),
          isEditing: t.exposeBoolean('isEditing'),
          isSelected: t.exposeBoolean('isSelected'),
          createdBy: t.exposeString('createdBy'),
          createdAt: t.exposeFloat('createdAt'),
          updatedAt: t.exposeFloat('updatedAt'),
          version: t.exposeFloat('version'),
        }),
      }),
      resolve: (payload) => payload.textElement,
    }),
    timestamp: t.exposeFloat('timestamp'),
  }),
});

builder.inputType('BoardActionInput', {
  fields: (t) => ({
    type: t.string({ required: true }),
    data: t.string({ required: true }),
  }),
});

builder.subscriptionType({
  fields: (t) => ({
    boardUpdates: t.field({
      type: BoardRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('boardUpdates', boardId),
      resolve: (payload: Board) => payload,
    }),
    userJoined: t.field({
      type: UserRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('userJoined', boardId),
      resolve: (payload: User) => payload,
    }),
    userLeft: t.field({
      type: builder.objectRef<{ id: string }>('UserLeft').implement({
        fields: (t) => ({ id: t.exposeString('id') }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('userLeft', boardId),
      resolve: (payload: { id: string }) => payload,
    }),
    cursorMovement: t.field({
      type: builder.objectRef<{ x: number; y: number, userId: string; name: string }>('Cursor').implement({
        fields: (t) => ({
          x: t.exposeInt('x'),
          y: t.exposeInt('y'),
          userId: t.exposeString('userId'),
          name: t.exposeString('name'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('cursorMovement', boardId),
      resolve: (payload: { x: number; y: number; userId: string; name: string }) => payload,
    }),
    collaboratorInvited: t.field({
      type: builder.objectRef<{ boardId: string; inviteeEmail: string; inviterName: string }>('CollaboratorInvitedPayload').implement({
        fields: (t) => ({
          boardId: t.exposeString('boardId'),
          inviteeEmail: t.exposeString('inviteeEmail'),
          inviterName: t.exposeString('inviterName'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('collaboratorInvited', boardId),
      resolve: (payload: { boardId: string; inviteeEmail: string; inviterName: string }) => payload,
    }),
    collaboratorJoined: t.field({
      type: builder.objectRef<{ boardId: string; collaborator: User; boardName: string }>('CollaboratorJoinedPayload').implement({
        fields: (t) => ({
          boardId: t.exposeString('boardId'),
          collaborator: t.field({
            type: UserRef,
            resolve: (payload) => payload.collaborator,
          }),
          boardName: t.exposeString('boardName'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('collaboratorJoined', boardId),
      resolve: (payload: { boardId: string; collaborator: User; boardName: string }) => payload,
    }),
    invitationStatusChanged: t.field({
      type: builder.objectRef<{ invitationId: string; status: string; email: string }>('InvitationStatusChangedPayload').implement({
        fields: (t) => ({
          invitationId: t.exposeString('invitationId'),
          status: t.exposeString('status'),
          email: t.exposeString('email'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('invitationStatusChanged', boardId),
      resolve: (payload: { invitationId: string; status: string; email: string }) => payload,
    }),
    drawingStarted: t.field({
      type: DrawingEventPayloadRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('drawingStarted', boardId),
      resolve: (payload: DrawingEventPayload) => payload,
    }),
    drawingUpdated: t.field({
      type: DrawingEventPayloadRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('drawingUpdated', boardId),
      resolve: (payload: DrawingEventPayload) => payload,
    }),
    drawingCompleted: t.field({
      type: DrawingEventPayloadRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('drawingCompleted', boardId),
      resolve: (payload: DrawingEventPayload) => payload,
    }),
    textElementCreated: t.field({
      type: TextEventPayloadRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('textElementCreated', boardId),
      resolve: (payload: TextEventPayload) => payload,
    }),
    textElementUpdated: t.field({
      type: TextEventPayloadRef,
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('textElementUpdated', boardId),
      resolve: (payload: TextEventPayload) => payload,
    }),
    textElementDeleted: t.field({
      type: builder.objectRef<{ boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }>('TextElementDeleted').implement({
        fields: (t) => ({
          boardId: t.exposeString('boardId'),
          userId: t.exposeString('userId'),
          userName: t.exposeString('userName'),
          textElementId: t.exposeString('textElementId'),
          timestamp: t.exposeFloat('timestamp'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('textElementDeleted', boardId),
      resolve: (payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }) => payload,
    }),
    textElementEditingStarted: t.field({
      type: builder.objectRef<{ boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }>('TextElementEditingStarted').implement({
        fields: (t) => ({
          boardId: t.exposeString('boardId'),
          userId: t.exposeString('userId'),
          userName: t.exposeString('userName'),
          textElementId: t.exposeString('textElementId'),
          timestamp: t.exposeFloat('timestamp'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('textElementEditingStarted', boardId),
      resolve: (payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }) => payload,
    }),
    textElementEditingFinished: t.field({
      type: builder.objectRef<{ boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }>('TextElementEditingFinished').implement({
        fields: (t) => ({
          boardId: t.exposeString('boardId'),
          userId: t.exposeString('userId'),
          userName: t.exposeString('userName'),
          textElementId: t.exposeString('textElementId'),
          timestamp: t.exposeFloat('timestamp'),
        }),
      }),
      args: {
        boardId: t.arg.string({ required: true }),
      },
      subscribe: (_, { boardId }) => pubSub.subscribe('textElementEditingFinished', boardId),
      resolve: (payload: { boardId: string; userId: string; userName: string; textElementId: string; timestamp: number }) => payload,
    }),
  }),
});

export const schema = builder.toSchema(); 