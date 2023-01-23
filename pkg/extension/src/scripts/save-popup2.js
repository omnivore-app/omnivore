// HTML CSS JSResult Skip Results Iframe
// EDIT ON
/* global
  ACTIONS
  CREATE_ARTICLE_QUERY
  CREATE_ARTICLE_SAVING_REQUEST_QUERY
  ENV_IS_FIREFOX
  ENV_IS_EDGE
  browserApi
  browserActionApi
  browserScriptingApi
  fetch
  XMLHttpRequest
*/

'use strict'

let authToken = undefined

const result = document.getElementById('result')
const filter = document.getElementById('filter')
const pushData = document?.getElementById('pushData')
const listItems = []
getData()

console.log('this is vijayr file in ran ')

console.log('authToken', authToken)
// async function getAuthToken() {
//     if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendNativeMessage) {
//         const response = await browser.runtime.sendNativeMessage("omnivore", {message: ACTIONS.GetAuthToken})
//         if (response.authToken) {
//           authToken = response.authToken;
//           console.log('authToken', authToken)
//         }
//       }
// }

// getAuthToken()

filter.addEventListener('input', (e) => filterData(e.target.value))
pushData?.addEventListener('input', (e) => console.log(e.target.value))
var testArray = []
var selectedArray = []

async function getData() {
  const res = await fetch('http://localhost:4000/api/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query:
        '\n    query GetLabels {\n      labels {\n        ... on LabelsSuccess {\n          labels {\n            ...LabelFields\n          }\n        }\n        ... on LabelsError {\n          errorCodes\n        }\n      }\n    }\n    \n  fragment LabelFields on Label {\n    id\n    name\n    color\n    description\n    createdAt\n  }\n\n  ',
    }),
    headers: {
      'x-rapidapi-key': 'your_api_key',
      'Content-Type': 'application/json',
    },
  })

  // const res = await fetch('http://localhost:4000/api/graphql', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       query: "query { __typename }",
  //     }),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })

  const { results } = await res.json()
  // Clear result
  testArray = results
  result.innerHTML = ''
  // tag.innerHTML = ''

  // selectedArray.map((user)=>{
  //     const tag = document.createElement('')
  // })

  results.map((user, index) => {
    const li = document.createElement('li')
    listItems.push(li)
    li.innerHTML = `
<div class="cellDev">
<div class="RoundLabel" style="background-color: red;">

</div>
<h4 class="titleLabelLeft" style="color: red;" > ${user.name.first} ${user.name.last} </h2>
<input type="checkbox"   onclick="addArray(${index}) class="checkboxStyle" />
</div>

 `
    result.appendChild(li)
  })
}
function addArray(index) {
  let obj = testArray[index]
  if (
    selectedArray.length &&
    selectedArray.filter((item) => item.email == obj.email).length
  ) {
    selectedArray = selectedArray.filter((item) => item.email != obj.email)
    //    console.log("Removed Object ",selectedArray)
  } else {
    selectedArray.push(obj)

    console.log('selected Array', selectedArray)
  }
}
function filterData(searchTerm) {
  console.log('😍', listItems.length, searchTerm.toLowerCase())
  listItems.forEach((item) => {
    console.log('😡', item.innerText.toLowerCase())
    if (item.innerText.toLowerCase().includes(searchTerm.toLowerCase())) {
      item.classList.remove('hide')
    } else {
      item.classList.add('hide')
    }
  })
}
