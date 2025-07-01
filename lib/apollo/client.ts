import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

// Using HTTP-only client for compatibility with Next.js App Router
// WebSocket subscriptions will be implemented later using SSE or alternative approach
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
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
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
}); 