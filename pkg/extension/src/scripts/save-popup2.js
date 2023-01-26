'use strict'

// HTML CSS JSResult Skip Results Iframe
// EDIT ON
const result = document.getElementById('result')
const filter = document.getElementById('filter')
const pushData = document?.getElementById('pushData')
var actionSavedLabel = document.getElementById('action-Saved-Button-Label')
const listItems = []
getData()

actionSavedLabel.addEventListener(
  'click',
  function (e) {
    console.log('here it taps saved 🧑‍🎨 ')
  },
  false
)

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
      //'x-rapidapi-key': 'your_api_key',
      'Content-Type': 'application/json',
    },
  })

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
<div class="RoundLabel" style="background-color: black;">
</div>
<h4 class="titleLabelLeft" style="color: black;" > ${user.name.first} ${user.name.last} </h2>
<input type="checkbox"   onclick="addArray(${index})" class="checkboxStyle" />
</div>

 `
    result.appendChild(li)
  })
}
function addArray(index) {
  console.log('🤪', actionSavedLabel)

  let obj = testArray[index]
  if (
    selectedArray.length &&
    selectedArray.filter((item) => item.email == obj.email).length
  ) {
    selectedArray = selectedArray.filter((item) => item.email != obj.email)
    //    console.log("Removed Object ",selectedArray)
  } else {
    selectedArray.push(obj)
  }
  console.log('selected Array 😗', selectedArray.length)

  if (selectedArray.length > 0) {
    actionSavedLabel.style.backgroundColor = 'yellow'
    actionSavedLabel.disabled = false
  } else {
    actionSavedLabel.style.backgroundColor = 'lightgray'
    actionSavedLabel.disabled = true
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
