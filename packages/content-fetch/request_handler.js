const { fetchContent } = require("@omnivore/puppeteer-parse");
const { uploadPdf, sendSavePageMutation, sendCreateArticleMutation, sendImportStatusUpdate } = require('./api');

const MAX_RETRY_COUNT = process.env.MAX_RETRY_COUNT || '1';

exports.contentFetchRequestHandler = async (req, res) => {
  let functionStartTime = Date.now();

  const userId = (req.query ? req.query.userId : undefined) || (req.body ? req.body.userId : undefined);
  const articleSavingRequestId = (req.query ? req.query.saveRequestId : undefined) || (req.body ? req.body.saveRequestId : undefined);
  const state = req.body.state
  const labels = req.body.labels
  const source = req.body.source || 'puppeteer-parse';
  const taskId = req.body.taskId; // taskId is used to update import status
  const url = (req.query ? req.query.url : undefined) || (req.body ? req.body.url : undefined);
  const locale = (req.query ? req.query.locale : undefined) || (req.body ? req.body.locale : undefined);
  const timezone = (req.query ? req.query.timezone : undefined) || (req.body ? req.body.timezone : undefined);
  const rssFeedUrl = req.body.rssFeedUrl;
  const savedAt = req.body.savedAt;
  const publishedAt = req.body.publishedAt;
  const folder = req.body.folder;
  const users = req.body ? req.body.users : undefined; // users is used when saving article for multiple users

  let logRecord = {
    url,
    userId,
    articleSavingRequestId,
    labels: {
      source,
    },
    state,
    labelsToAdd: labels,
    taskId: taskId,
    locale,
    timezone,
    rssFeedUrl,
    savedAt,
    publishedAt,
    folder,
    users,
  };

  console.log(`Article parsing request`, logRecord);

  let importStatus, statusCode = 200;

  try {
    const { finalUrl, title, content, readabilityResult, contentType } = await fetchContent(url, locale, timezone);
    if (contentType === 'application/pdf') {
      const uploadFileId = await uploadPdf(finalUrl, userId, articleSavingRequestId);
      const uploadedPdf = await sendCreateArticleMutation(userId, {
        url: encodeURI(finalUrl),
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
        statusCode = 500;
        logRecord.error = 'error while saving uploaded pdf';
      } else {
        importStatus = 'imported';
      }
    } else {
      const apiResponse = await sendSavePageMutation(userId, {
        url,
        clientRequestId: articleSavingRequestId,
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
        logRecord.error = 'error while saving page';
        statusCode = 500;
      } else if (apiResponse.error === 'UNAUTHORIZED') {
        console.log('user is deleted, do not retry', logRecord);
        return res.sendStatus(200);
      } else {
        importStatus = readabilityResult ? 'imported' : 'failed';
      }
    }
  } catch (error) {
    logRecord.error = error.message;
  } finally {
    logRecord.totalTime = Date.now() - functionStartTime;
    console.log(`parse-page result`, logRecord);

    // mark import failed on the last failed retry
    const retryCount = req.headers['x-cloudtasks-taskretrycount'];
    if (retryCount === MAX_RETRY_COUNT) {
      console.log('max retry count reached');
      importStatus = importStatus || 'failed';
    }

    // send import status to update the metrics
    if (taskId && importStatus) {
      await sendImportStatusUpdate(userId, taskId, importStatus);
    }

    res.sendStatus(statusCode); 
  }
}
