import { NextRequest } from 'next/server';
import { createYoga } from 'graphql-yoga';
import { schema } from '@/lib/graphql/schema';
import '@/lib/env';

// Use pre-built GraphQL schema

// Create Yoga instance with WebSocket support
const yoga = createYoga({
  schema,
  graphiql: process.env.NODE_ENV === 'development',
  landingPage: false,
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://www.whizboard.space', 'https://whizboard.space', 'https://whizboard.cyperstudio.in']
      : ['http://localhost:3000'],
    credentials: true,
  },
  // Note: WebSocket server is configured at the edge/runtime level or in a custom server.
  // graphql-yoga v5 does not accept a `websockets` option in createYoga().
});

export async function GET(request: NextRequest) {
  return yoga.handleNodeRequest(request);
}

export async function POST(request: NextRequest) {
  return yoga.handleNodeRequest(request);
}

// WebSocket upgrade handler
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? 'https://www.whizboard.space'
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
} 