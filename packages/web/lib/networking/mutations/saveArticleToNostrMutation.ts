// packages/web/lib/networking/mutations/saveArticleToNostrMutation.ts
import { gql } from 'graphql-request';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { graphQLClient } from '../networkHelpers'; // Assuming a shared client

// Mirroring the GQL schema:
// enum NostrPublishType { PUBLIC, PRIVATE }
// type SaveArticleToNostrSuccess { nostrEventIdKind30000: ID, nostrEventIdKind30000: ID, message: String! }
// enum SaveArticleToNostrErrorCode { ARTICLE_NOT_FOUND, NOSTR_PUBLISH_ERROR, NOSTR_SIGNING_ERROR, UNAUTHORIZED, BAD_REQUEST }
// type SaveArticleToNostrError { errorCodes: [SaveArticleToNostrErrorCode!]!, message: String }
// union SaveArticleToNostrResult = SaveArticleToNostrSuccess | SaveArticleToNostrError

export interface SaveArticleToNostrVars {
  articleId: string;
  publishAs: 'PUBLIC' | 'PRIVATE'; // Corresponds to NostrPublishType enum
}

export interface SaveArticleToNostrData {
  saveArticleToNostr: {
    __typename: 'SaveArticleToNostrSuccess' | 'SaveArticleToNostrError';
    nostrEventIdKind30000?: string;
    nostrEventIdKind30001?: string;
    message?: string;
    errorCodes?: string[];
  };
}

const SAVE_ARTICLE_TO_NOSTR = gql`
  mutation SaveArticleToNostr($articleId: ID!, $publishAs: NostrPublishType!) {
    saveArticleToNostr(articleId: $articleId, publishAs: $publishAs) {
      __typename
      ... on SaveArticleToNostrSuccess {
        nostrEventIdKind30000
        nostrEventIdKind30001
        message
      }
      ... on SaveArticleToNostrError {
        errorCodes
        message
      }
    }
  }
`;

export const useSaveArticleToNostrMutation = (
  options?: UseMutationOptions<SaveArticleToNostrData, unknown, SaveArticleToNostrVars>
) => {
  return useMutation<SaveArticleToNostrData, unknown, SaveArticleToNostrVars>(
    async (variables) => {
      return graphQLClient.request<SaveArticleToNostrData, SaveArticleToNostrVars>(
        SAVE_ARTICLE_TO_NOSTR,
        variables
      );
    },
    options
  );
};
