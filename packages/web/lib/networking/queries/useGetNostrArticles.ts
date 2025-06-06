// packages/web/lib/networking/queries/useGetNostrArticles.ts
import { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { graphQLClient } from '../networkHelpers'; // Assuming a shared client

// Mirroring the GQL schema for NostrArticle and GetNostrArticlesResult
export interface NostrArticle {
  id: string;
  omnivoreId?: string;
  url: string;
  title: string;
  content?: string;
  author?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  publishedToNostrAt: number;
  isPrivate: boolean;
}

export interface NostrArticleEdge {
  __typename: 'NostrArticleEdge';
  cursor: string;
  node: NostrArticle;
}

export interface GetNostrArticlesData {
  getNostrArticles: {
    __typename: 'GetNostrArticlesSuccess' | 'GetNostrArticlesError';
    edges?: NostrArticleEdge[];
    message?: string;
    errorCodes?: string[];
  };
}

export interface GetNostrArticlesVars {
  filterJson?: Record<string, any>; // For Nostr filters like { kinds: [30000], authors: ['pubkey'] }
}

const GET_NOSTR_ARTICLES = gql`
  query GetNostrArticles($filterJson: JSON) {
    getNostrArticles(filterJson: $filterJson) {
      __typename
      ... on GetNostrArticlesSuccess {
        message
        edges {
          __typename
          cursor
          node {
            id
            omnivoreId
            url
            title
            # content # Content might be large, fetch on demand later if needed
            author
            description
            imageUrl
            tags
            publishedToNostrAt
            isPrivate
          }
        }
      }
      ... on GetNostrArticlesError {
        errorCodes
        message
      }
    }
  }
`;

export const useGetNostrArticles = (
  variables: GetNostrArticlesVars,
  options?: UseQueryOptions<GetNostrArticlesData, unknown, GetNostrArticlesData>
) => {
  return useQuery<GetNostrArticlesData, unknown, GetNostrArticlesData>(
    ['getNostrArticles', variables], // Query key
    async () => {
      return graphQLClient.request<GetNostrArticlesData, GetNostrArticlesVars>(
        GET_NOSTR_ARTICLES,
        variables
      );
    },
    options
  );
};
