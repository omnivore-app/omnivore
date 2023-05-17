function gqlRequest(apiUrl, query) {
  return getStorageItem('apiKey')
    .then((apiKey) => {
      return fetch(apiUrl, {
        method: 'POST',
        redirect: 'follow',
        credentials: 'include',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: apiKey ? apiKey : undefined,
        },
        body: query,
      })
    })
    .then((response) => response.json())
    .then((json) => {
      if (!json['data']) {
        throw new Error('No response data')
      }
      return json['data']
    })
}

async function updateLabelsCache(apiUrl, tab) {
  const query = JSON.stringify({
    query: `query GetLabels {
      labels {
        ... on LabelsSuccess {
          labels {
            ...LabelFields
          }
        }
        ... on LabelsError {
          errorCodes
        }
      }
    }
    fragment LabelFields on Label {
      id
      name
      color
      description
      createdAt
    }
    `,
  })

  const data = await gqlRequest(apiUrl, query)
  if (!data.labels || data.labels['errorCodes'] || !data.labels['labels']) {
    console.log('GQL Error updating label cache response:', data, data)
    console.log(!data.labels, data.labels['errorCodes'], !data.labels['labels'])
    return []
  }
  await setStorage({
    labels: data.labels.labels,
    labelsLastUpdated: new Date().toISOString(),
  })

  return data.labels.labels
}

async function updatePageTitle(apiUrl, pageId, title) {
  const mutation = JSON.stringify({
    query: `mutation UpdatePage($input: UpdatePageInput!) {
      updatePage(input: $input) {
        ... on UpdatePageSuccess {
          updatedPage {
            id
          }
        }
        ... on UpdatePageError {
          errorCodes
        }
      }
    }
  `,
    variables: {
      input: {
        pageId,
        title,
      },
    },
  })

  const data = await gqlRequest(apiUrl, mutation)
  if (
    !data.updatePage ||
    data.updatePage['errorCodes'] ||
    !data.updatePage['updatedPage']
  ) {
    console.log('GQL Error updating page:', data)
    throw new Error('Error updating title.')
  }
  return data.updatePage.updatePage
}

async function setLabels(apiUrl, pageId, labelIds) {
  const mutation = JSON.stringify({
    query: `mutation SetLabels($input: SetLabelsInput!) {
      setLabels(input: $input) {
        ... on SetLabelsSuccess {
          labels {
            id
          }
        }
        ... on SetLabelsError {
          errorCodes
        }
      }
    }
  `,
    variables: {
      input: {
        pageId,
        labelIds,
      },
    },
  })

  const data = await gqlRequest(apiUrl, mutation)
  if (
    !data.setLabels ||
    data.setLabels['errorCodes'] ||
    !data.setLabels['labels']
  ) {
    console.log('GQL Error setting labels:', data)
    throw new Error('Error setting labels.')
  }
  return data.setLabels.labels
}
