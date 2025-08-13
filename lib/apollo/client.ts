import { ApolloClient, InMemoryCache, createHttpLink, from, split, ApolloLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import logger from '@/lib/logger/logger';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

// WebSocket link for subscriptions
const createWebSocketLink = () => {
  // Use secure WebSocket in production, regular in development
  const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  
  const wsClient = createClient({
    url: `${protocol}://${host}/api/graphql/ws`,
    connectionParams: {
      // Add any authentication headers here
      // authToken: getAuthToken(),
    },
    retryAttempts: 5,
    retryWait: (retryCount) => new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 30000))),
    shouldRetry: (errorOrCloseEvent) => {
      // Retry on network errors, but not on authentication errors
      if (errorOrCloseEvent instanceof Error) {
        return !errorOrCloseEvent.message.includes('authentication');
      }
      return true;
    },
    on: {
      connecting: () => {
        logger.info('WebSocket connecting...');
      },
      connected: () => {
        logger.info('WebSocket connected');
      },
      closed: (event: any) => {
        logger.info({ code: event.code, reason: event.reason }, 'WebSocket closed');
      },
      error: (error) => {
        logger.warn({ error }, 'WebSocket error - this is expected if WebSocket endpoint is not available');
      },
    },
  });

  return new GraphQLWsLink(wsClient);
};

// Split links based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  createWebSocketLink(),
  httpLink
);

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Board: {
      fields: {
        elements: {
          merge(_, incoming) {
            return incoming;
          },
        },
        collaborators: {
          merge(_, incoming) {
            return incoming;
          },
        },
        history: {
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
    Query: {
      fields: {
        getBoard: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Create error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      logger.error({
        message,
        locations,
        path,
        operationName: operation.operationName,
      }, 'GraphQL error');
    });
  }

  if (networkError) {
    logger.warn({
      networkError: networkError.message,
      operationName: operation.operationName,
    }, 'Network error in GraphQL operation - this may be expected during development');
  }
});

// Create logging link
const loggingLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();
  
  return forward(operation).map((response) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (response.data) {
      logger.debug({
        operationName: operation.operationName,
        variables: operation.variables,
        duration,
      }, 'GraphQL operation successful');
    }
    
    return response;
  });
});

// Create Apollo Client with error handling
export const client = new ApolloClient({
  link: from([
    errorLink,
    loggingLink,
    splitLink,
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Export a function to reset the client (useful for testing or error recovery)
export const resetClient = () => {
  client.resetStore();
  logger.info('Apollo client store reset');
};

// Export a function to clear the cache
export const clearCache = () => {
  client.clearStore();
  logger.info('Apollo client cache cleared');
};

// Export connection status helpers
export const getConnectionStatus = () => {
  // This would need to be implemented based on your WebSocket client
  // For now, we'll return a basic status
  return {
    isConnected: true, // This should be updated based on actual connection state
    lastError: null,
    retryCount: 0,
  };
}; 