const { interfaces } = require('mocha');
const { uploadPdf, sendSavePageMutation, sendCreateArticleMutation, sendImportStatusUpdate } = require('./api');

interface Item {
  url: string;
  userId: string;
  contentType: string;
  articleSavingRequestId: string;
  state: string;
  labels: string[];
  source: string;
  folder: string;
  rssFeedUrl: string;
  savedAt: string;
  publishedAt: string;
  readabilityResult: string;
}

exports.saveItem = async (item: Item) => {
  const { url, userId, contentType, articleSavingRequestId, state, labels, source, folder, rssFeedUrl, savedAt, publishedAt, readabilityResult } = item;
  try {
    if (contentType === 'application/pdf') {
      const uploadFileId = await uploadPdf(url, userId, articleSavingRequestId);
      const uploadedPdf = await sendCreateArticleMutation(userId, {
        url: encodeURI(url),
        articleSavingRequestId,
        uploadFileId,
        state,
        labels,
        source,
        folder,
        rssFeedUrl,
        savedAt,
        publishedAt,
      });
      if (!uploadedPdf) {
        console.error('error while saving uploaded pdf', url);
        return false;
      }
    } else {
      const apiResponse = await sendSavePageMutation(userId, {
        url,
        clientRequestId: articleSavingRequestId,h
        title,
        originalContent: content,
        parseResult: readabilityResult,
        state,
        labels,
        rssFeedUrl,
        savedAt,
        publishedAt,
        source,
        folder,
      });
      if (!apiResponse) {
        console.error('error while saving page', url);
        return false;
      } else if (apiResponse.error === 'UNAUTHORIZED') {
        console.log('user is deleted, do not retry', userId);
        return true;
      } else {
        importStatus = readabilityResult ? 'imported' : 'failed';
      }
    }
  } catch (error) {
    logRecord.error = error.message;
  } finally {
    // mark import failed on the last failed retry
    const retryCount = req.headers['x-cloudtasks-taskretrycount'];
    if (retryCount === MAX_RETRY_COUNT) {
      console.log('max retry count reached');
      importStatus = importStatus || 'failed';
    }
  }
}
