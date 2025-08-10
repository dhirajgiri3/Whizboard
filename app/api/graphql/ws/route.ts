import { NextRequest } from 'next/server';
import { createYoga } from 'graphql-yoga';
import { createPubSub } from 'graphql-yoga';
import { schema } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

// Create pubsub instance for real-time subscriptions
const pubsub = createPubSub();

// Use pre-built GraphQL schema

// Create Yoga instance with WebSocket support
const yoga = createYoga({
  schema,
  graphiql: process.env.NODE_ENV === 'development',
  landingPage: false,
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    credentials: true,
  },
  websockets: {
    onConnect: (ctx) => {
      logger.info({ connectionParams: ctx.connectionParams }, 'WebSocket client connected');
    },
    onDisconnect: (ctx) => {
      logger.info('WebSocket client disconnected');
    },
    onSubscribe: (ctx, message) => {
      logger.debug({ message }, 'WebSocket subscription started');
    },
    onNext: (ctx, message, args, result) => {
      logger.debug({ message, result }, 'WebSocket subscription data sent');
    },
    onError: (ctx, message, errors) => {
      logger.error({ message, errors }, 'WebSocket subscription error');
    },
  },
});

export async function GET(request: NextRequest) {
  return yoga.handleNodeRequest(request, {
    req: request,
  });
}

export async function POST(request: NextRequest) {
  return yoga.handleNodeRequest(request, {
    req: request,
  });
}

// WebSocket upgrade handler
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
} 