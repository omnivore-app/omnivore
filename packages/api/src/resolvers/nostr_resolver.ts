// packages/api/src/resolvers/nostr_resolver.ts
import { UserInputError } from 'apollo-server-express';
import { UserInputError } from 'apollo-server-express';
import { nostrService, OmnivoreArticle } from '../services/nostr_service';
import {
  NostrPublishType,
  SaveArticleToNostrErrorCode,
  SaveArticleToNostrResult,
  GetNostrArticlesErrorCode, // Added
  GetNostrArticlesResult, // Added
} from '../generated/graphql'; // Assuming this path after codegen
import { Context } from '../apollo'; // Assuming context provides auth info

// Placeholder function to simulate fetching Omnivore article data
// In a real implementation, this would use LibraryItemService or similar
async function getOmnivoreArticleById(articleId: string, userId: string): Promise<OmnivoreArticle | null> {
  console.log(`[Resolver] Placeholder: Fetching article ${articleId} for user ${userId}`);
  if (articleId === "nonexistent") {
    return null;
  }
  // Simulate fetching data. Replace with actual service call.
  return {
    id: articleId,
    url: `https://example.com/article/${articleId}`,
    title: `Sample Article ${articleId}`,
    content: `<p>This is the full content of article ${articleId}.</p>`,
    excerpt: `Excerpt for article ${articleId}.`,
    author: "John Doe",
    omnivoreTags: ["sample", "nostr"],
  };
}

export const nostrResolvers = {
  Query: { // Add Query block if it doesn't exist, or merge
    getNostrArticles: async (
      _: any,
      { filterJson }: { filterJson: any }, // filterJson is expected to be Nostr filter object
      context: Context
    ): Promise<GetNostrArticlesResult> => { // Adjusted return type
      // TODO: Add authentication check using context.userId
      // if (!context.userId) {
      //   return { __typename: "GetNostrArticlesError", errorCodes: [GetNostrArticlesErrorCode.UNAUTHORIZED], message: "User not authenticated" };
      // }

      const userPublicKeyHex = nostrService.getPublicKeyHex(); // Get configured user's pubkey
      if (!userPublicKeyHex) {
        return {
          __typename: "GetNostrArticlesError",
          errorCodes: [GetNostrArticlesErrorCode.UNAUTHORIZED], // Or a more specific config error
          message: "User Nostr public key not configured in service.",
        };
      }

      // Default filters: fetch user's own kind:30000 events
      const defaultFilters = {
        authors: [userPublicKeyHex],
        kinds: [30000],
        // limit: 20 // Example limit
      };

      const finalFilters = filterJson ? { ...defaultFilters, ...filterJson } : defaultFilters;

      try {
        // Add a way to simulate content for testing, since fetchEvents is a placeholder
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          // This structure assumes finalFilters is an object. If it's an array from filterJson, adjust accordingly.
          if (Array.isArray(finalFilters)) {
             // if filterJson was an array, this won't work directly.
             // For now, assume filterJson is an object to be merged with defaultFilters
             // or that the first element of the array is the main filter object.
             if (finalFilters.length > 0 && typeof finalFilters[0] === 'object') {
                finalFilters[0].simulateContent = true;
             } else { // Or, if finalFilters was just the object, not in an array
                (finalFilters as any).simulateContent = true;
             }
          } else {
            (finalFilters as any).simulateContent = true;
          }
        }

        // nostrService.fetchAndDecryptArticles expects an array of filters
        const articles = await nostrService.fetchAndDecryptArticles( Array.isArray(finalFilters) ? finalFilters : [finalFilters]);

        // Create edges for GraphQL compatibility
        const edges = articles.map((article, index) => ({
          __typename: "NostrArticleEdge",
          cursor: article.id || `cursor-${index}`, // Use event ID or index as cursor
          node: article,
        }));

        return {
          __typename: "GetNostrArticlesSuccess",
          edges: edges,
          message: `Fetched ${articles.length} articles from Nostr.`,
        };
      } catch (error: any) {
        console.error('[NostrResolver] Error fetching articles from Nostr:', error);
        let errorCode = GetNostrArticlesErrorCode.NOSTR_FETCH_ERROR;
        if (error.message.includes("decrypt")) {
            errorCode = GetNostrArticlesErrorCode.NOSTR_DECRYPTION_ERROR;
        }
        return {
          __typename: "GetNostrArticlesError",
          errorCodes: [errorCode],
          message: error.message || 'Failed to fetch articles from Nostr.',
        };
      }
    },
  },
  Mutation: {
    saveArticleToNostr: async (
      _: any,
      { articleId, publishAs }: { articleId: string; publishAs: NostrPublishType },
      context: Context // Use context for authentication/authorization
    ): Promise<SaveArticleToNostrResult> => {
      // TODO: Add authentication check using context.userId or similar
      // if (!context.userId) {
      //   return {
      //     __typename: "SaveArticleToNostrError", // Required for GraphQL unions
      //     errorCodes: [SaveArticleToNostrErrorCode.UNAUTHORIZED],
      //     message: "User not authenticated",
      //   };
      // }
      const userId = "placeholder-user-id"; // Replace with actual userId from context

      const article = await getOmnivoreArticleById(articleId, userId);

      if (!article) {
        return {
          __typename: "SaveArticleToNostrError",
          errorCodes: [SaveArticleToNostrErrorCode.ARTICLE_NOT_FOUND],
          message: `Article with ID ${articleId} not found.`,
        };
      }

      const isPrivate = publishAs === NostrPublishType.Private;

      try {
        // 1. Create and sign kind:30000 event (metadata)
        let kind30000Event = await nostrService.mapArticleToNostrKind30000(article, isPrivate);
        kind30000Event = await nostrService.signEvent(kind30000Event);

        if (!kind30000Event.id) {
            throw new Error("Failed to sign kind:30000 event, ID missing.");
        }

        // 2. Create and sign kind:30001 event (content)
        let kind30001Event = await nostrService.mapArticleToNostrKind30001(
          article.content,
          kind30000Event.id,
          isPrivate
        );
        kind30001Event = await nostrService.signEvent(kind30001Event);

        if (!kind30001Event.id) {
            throw new Error("Failed to sign kind:30001 event, ID missing.");
        }

        // 3. Publish both events
        // In a real scenario, you might want to publish to multiple relays or handle errors more gracefully.
        await nostrService.publishEvent(kind30000Event);
        await nostrService.publishEvent(kind30001Event);

        return {
          __typename: "SaveArticleToNostrSuccess", // Required for GraphQL unions
          nostrEventIdKind30000: kind30000Event.id,
          nostrEventIdKind30001: kind30001Event.id,
          message: `Article ${articleId} published to Nostr successfully.`,
        };
      } catch (error: any) {
        console.error('[NostrResolver] Error publishing article to Nostr:', error);
        // Determine error code based on error type
        let errorCode = SaveArticleToNostrErrorCode.NOSTR_PUBLISH_ERROR;
        if (error.message.includes("sign")) {
            errorCode = SaveArticleToNostrErrorCode.NOSTR_SIGNING_ERROR;
        }
        return {
          __typename: "SaveArticleToNostrError",
          errorCodes: [errorCode],
          message: error.message || 'Failed to publish article to Nostr.',
        };
      }
    },
  },
};
