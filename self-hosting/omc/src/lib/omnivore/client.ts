/**
 * Re-export Omnivore client functions for TypeScript imports
 * AIDEV-NOTE: Thin wrapper - actual implementation in /lib/omnivore/client.js
 */
export {
  getMe,
  searchArticles,
  getArticle,
  getArticlesByDate,
  getArticlesByLabel,
  getRecentArticles,
  searchByTopic,
  getUnreadArticles,
  getLabels,
  getHighlights,
  updatePage,
  createLabel,
  setLabels,
  saveUrl,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  testConnection,
} from '../../../lib/omnivore/client.js';
