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

// Connection quality monitoring
interface ConnectionQuality {
  latency: number;
  packetLoss: number;
  jitter: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

let connectionQuality: ConnectionQuality = {
  latency: 0,
  packetLoss: 0,
  jitter: 0,
  quality: 'good'
};

// Enhanced WebSocket link for subscriptions with connection quality monitoring
const createWebSocketLink = () => {
  // Use secure WebSocket in production, regular in development
  const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  
  let retryCount = 0;
  const lastPingTime = 0;
  let connectionStartTime = 0;
  
  const wsClient = createClient({
    url: `${protocol}://${host}/api/graphql/ws`,
    connectionParams: {
      // Add any authentication headers here
      // authToken: getAuthToken(),
    },
    retryAttempts: 10, // Increased retry attempts
    retryWait: (retryCount) => {
      // Enhanced exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      return new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
    },
    shouldRetry: (errorOrCloseEvent) => {
      // Enhanced retry logic
      if (errorOrCloseEvent instanceof Error) {
        // Don't retry on authentication errors
        if (errorOrCloseEvent.message.includes('authentication')) {
          return false;
        }
        // Don't retry on certain close codes
        if (errorOrCloseEvent.message.includes('1002') || errorOrCloseEvent.message.includes('1003')) {
          return false;
        }
      }
      
      // Limit retries based on connection quality
      if (connectionQuality.quality === 'poor' && retryCount > 3) {
        return false;
      }
      
      return retryCount < 10;
    },
    on: {
      connecting: () => {
        connectionStartTime = Date.now();
        retryCount++;
        logger.info(`WebSocket connecting... (attempt ${retryCount})`);
      },
      connected: () => {
        const connectionTime = Date.now() - connectionStartTime;
        retryCount = 0; // Reset retry count on successful connection
        
        // Update connection quality based on connection time
        if (connectionTime < 1000) {
          connectionQuality.quality = 'excellent';
        } else if (connectionTime < 3000) {
          connectionQuality.quality = 'good';
        } else if (connectionTime < 5000) {
          connectionQuality.quality = 'fair';
        } else {
          connectionQuality.quality = 'poor';
        }
        
        logger.info(`WebSocket connected in ${connectionTime}ms (quality: ${connectionQuality.quality})`);
        
        // Start connection monitoring
        startConnectionMonitoring();
      },
      closed: (event: any) => {
        logger.info({ code: event.code, reason: event.reason, retryCount }, 'WebSocket closed');
        
        // Update connection quality based on close reason
        if (event.code === 1000) {
          connectionQuality.quality = 'excellent'; // Normal closure
        } else if (event.code === 1001 || event.code === 1006) {
          connectionQuality.quality = 'poor'; // Abnormal closure
        }
      },
      error: (error) => {
        logger.warn({ error, retryCount }, 'WebSocket error');
        connectionQuality.quality = 'poor';
      },
    },
  });

  // Connection monitoring (simplified without ping)
  const startConnectionMonitoring = () => {
    // For now, we'll rely on the connection events for quality monitoring
    // In a production environment, you might want to implement custom ping/pong
    logger.info('Connection monitoring started');
  };

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
  return {
    isConnected: true, // This should be updated based on actual connection state
    lastError: null,
    retryCount: 0,
    connectionQuality,
  };
};

// Export connection quality getter
export const getConnectionQuality = (): ConnectionQuality => {
  return { ...connectionQuality };
};

// Export function to update connection quality
export const updateConnectionQuality = (quality: Partial<ConnectionQuality>) => {
  connectionQuality = { ...connectionQuality, ...quality };
}; 