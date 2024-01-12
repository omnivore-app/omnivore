const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = promisify(jwt.sign);

const IMPORTER_METRICS_COLLECTOR_URL = process.env.IMPORTER_METRICS_COLLECTOR_URL;
const REQUEST_TIMEOUT = 30000; // 30 seconds

exports.uploadToSignedUrl = async ({ id, uploadSignedUrl }, contentType, contentObjUrl) => {
  try {
    const stream = await axios.get(contentObjUrl, { responseType: 'stream', timeout: REQUEST_TIMEOUT });
    return axios.put(uploadSignedUrl, stream.data, {
      headers: {
        'Content-Type': contentType,
      },
      maxBodyLength: 1000000000,
      maxContentLength: 100000000,
      timeout: REQUEST_TIMEOUT,
    });
  } catch (error) {
    console.error('error uploading to signed url', error.message);
    return null;
  }
};

exports.getUploadIdAndSignedUrl = async (userId, url, articleSavingRequestId) => {
  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  const data = JSON.stringify({
    query: `mutation UploadFileRequest($input: UploadFileRequestInput!) {
      uploadFileRequest(input:$input) {
        ... on UploadFileRequestError {
          errorCodes
        }
        ... on UploadFileRequestSuccess {
          id
          uploadSignedUrl
        }
      }
    }`,
    variables: {
      input: {
        url,
        contentType: 'application/pdf',
        clientRequestId: articleSavingRequestId,
      }
    }
  });

  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.uploadFileRequest.errorCodes && response.data.data.uploadFileRequest.errorCodes.length > 0) {
      console.error('Error while getting upload id and signed url', response.data.data.uploadFileRequest.errorCodes[0]);
      return null;
    }

    return response.data.data.uploadFileRequest;
  } catch (e) {
    console.error('error getting upload id and signed url', e.message);
    return null;
  }
};

exports.uploadPdf = async (url, userId, articleSavingRequestId) => {
  validateUrlString(url);

  const uploadResult = await getUploadIdAndSignedUrl(userId, url, articleSavingRequestId);
  if (!uploadResult) {
    throw new Error('error while getting upload id and signed url');
  }
  const uploaded = await uploadToSignedUrl(uploadResult, 'application/pdf', url);
  if (!uploaded) {
    throw new Error('error while uploading pdf');
  }
  return uploadResult.id;
};

exports.sendCreateArticleMutation = async (userId, input) => {
  const data = JSON.stringify({
    query: `mutation CreateArticle ($input: CreateArticleInput!){
          createArticle(input:$input){
            ... on CreateArticleSuccess{
              createdArticle{
                id
            }
        }
          ... on CreateArticleError{
              errorCodes
          }
      }
    }`,
    variables: {
      input,
    },
  });

  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.createArticle.errorCodes && response.data.data.createArticle.errorCodes.length > 0) {
      console.error('error while creating article', response.data.data.createArticle.errorCodes[0]);
      return null;
    }

    return response.data.data.createArticle;
  } catch (error) {
    console.error('error creating article', error.message);
    return null;
  }
};

exports.sendSavePageMutation = async (userId, input) => {
  const data = JSON.stringify({
    query: `mutation SavePage ($input: SavePageInput!){
          savePage(input:$input){
            ... on SaveSuccess{
              url
              clientRequestId
            }
            ... on SaveError{
                errorCodes
            }
          }
    }`,
    variables: {
      input,
    },
  });

  const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);
  try {
    const response = await axios.post(`${process.env.REST_BACKEND_ENDPOINT}/graphql`, data,
    {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
      timeout: REQUEST_TIMEOUT,
    });

    if (response.data.data.savePage.errorCodes && response.data.data.savePage.errorCodes.length > 0) {
      console.error('error while saving page', response.data.data.savePage.errorCodes[0]);
      if (response.data.data.savePage.errorCodes[0] === 'UNAUTHORIZED') {
        return { error: 'UNAUTHORIZED' };
      }

      return null;
    }

    return response.data.data.savePage;
  } catch (error) {
    console.error('error saving page', error.message);
    return null;
  }
};

exports.saveUploadedPdf = async (userId, url, uploadFileId, articleSavingRequestId) => {
  return sendCreateArticleMutation(userId, {
      url: encodeURI(url),
      articleSavingRequestId,
      uploadFileId: uploadFileId,
      state,
      labels,
      source,
      folder,
    },
  );
};

exports.sendImportStatusUpdate = async (userId, taskId, status) => {
  try {
    const auth = await signToken({ uid: userId }, process.env.JWT_SECRET);

    await axios.post(
      IMPORTER_METRICS_COLLECTOR_URL, 
      {
        taskId,
        status,
      },
      {
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT,
      });
  } catch (e) {
    console.error('error while sending import status update', e);
  }
};
