function updateLabelsCache(apiUrl, tab) {
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
  return fetch(apiUrl, {
    method: 'POST',
    redirect: 'follow',
    credentials: 'include',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: query,
  })
    .then((response) => response.json())
    .then((data) => {
      const result = data.data.labels.labels
      return result
    })
    .then((labels) => {
      setStorage({
        labels: labels,
        labelsLastUpdated: new Date().toISOString(),
      })
      return labels
    })
}

function updatePageTitle(apiUrl, pageId, title) {
  console.log('updated title: ', apiUrl, pageId, title)
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

  return fetch(apiUrl, {
    method: 'POST',
    redirect: 'follow',
    credentials: 'include',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: mutation,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('updated title: ', data)
    })
}

function setLabels(apiUrl, pageId, labelIds) {
  console.log('setting labels: ', apiUrl, pageId, labelIds)
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

  return fetch(apiUrl, {
    method: 'POST',
    redirect: 'follow',
    credentials: 'include',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: mutation,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('updated labels: ', data)
    })
}
