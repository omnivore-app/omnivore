// 'use strict'
// ;(function () {
  // This gets the link of the iframe -> then it returns [key, values] -> fromEntries method will return the object
  // const payload = Object.fromEntries([
  //   ...new URL(window.location.href).searchParams.entries(),
  // ])

  // const articleLinkEl = document.getElementById('get-article-link')
  // const titleEl = document.getElementById('article-title')

  // // articleLinkEl.href = payload.linkReadNow
  // // titleEl.innerText = payload.title + 'sdfhsdf skljdfh ksdhf ;)';
  // var titleInputEdit = document.getElementById('article-title-edit')

  // articleLinkEl.href = payload.linkReadNow

  // titleEl.innerText = payload.title
  // titleInputEdit.value = payload.title

  // fetch('https://api-prod.omnivore.app/api/graphql', {
  //   method: 'POST',
  //   data: JSON.stringify({
  //     query: `query GetLabels {
  //     labels {
  //       ... on LabelsSuccess {
  //         labels {
  //           ...LabelFields
  //         }
  //       }
  //       ... on LabelsError {
  //         errorCodes
  //       }
  //     }
  //   }`,
  //   }),
  //   headers: {
  //     'x-rapidapi-key': 'your_api_key',
  //   },
  // }).then((response) => {
  //   console.log('response', response)
  // })

  // (async function () {
  // const data = JSON.stringify({
  //   query: `query GetLabels {
  //   labels {
  //     ... on LabelsSuccess {
  //       labels {
  //         ...LabelFields
  //       }
  //     }
  //     ... on LabelsError {
  //       errorCodes
  //     }
  //   }
  // }`,
  // })()

  // const response = await fetch('https://api-prod.omnivore.app/api/graphql', {
  //   method: 'post',
  //   body: data,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': data.length,
  //   },
  // })
  // console.log('it is compiling.....')
  // const json =  await response.json()

  // console.log(JSON.stringify('fffffffffff', json.data))

  // TO DO: to replace with the API call for getLabels
  // var mycars = ['Herr', 'Frau']
  // var list = document.getElementById('brow')

  // mycars.forEach(function (item) {
  //   var option = document.createElement('option')
  //   option.value = item
  //   list.appendChild(option)
  // })

  // // Delete
  // var button = document.getElementById('action-delete-button')
  // button.addEventListener(
  //   'click',
  //   function (e) {
  //     console.log('here it taps ')
  //     titleEl.style.color = 'red'
  //   },
  //   false
  // )

  // // Archive
  // var buttonArchive = document.getElementById('action-archive-button')
  // buttonArchive.addEventListener(
  //   'click',
  //   function (e) {
  //     console.log('here it taps ')
  //     titleEl.style.color = 'gray'
  //   },
  //   false
  // )

  // // Edit
  // var buttonEdit = document.getElementById('action-edit1-button')
  // buttonEdit.addEventListener(
  //   'click',
  //   function (e) {
  //     console.log('here it taps ')
  //     titleEl.style.color = 'green'

  //     var x = document.getElementById('title-container')
  //     var y = document.getElementById('edit-Title-container-id')

  //     if (x.style.display === 'none') {
  //       x.style.display = 'block'
  //       y.style.display = 'none'
  //     } else {
  //       x.style.display = 'none'
  //       y.style.display = 'block'
  //     }
  //   },
  //   false
  // )

  //  action-edit1-button
  //  action-delete-button
  //  action-archive-button
// })()



'use strict'
  ; (function () {
    // This gets the link of the iframe -> then it returns [key, values] -> fromEntries method will return the object
    const payload = Object.fromEntries([
      ...new URL(window.location.href).searchParams.entries(),
    ])


    // const articleLinkEl = document.getElementById('get-article-link')

     const titleEl = document.getElementById('article-title')

     var titleInputEdit = document.getElementById("article-title-edit");

     var buttonState = "tab-3"


    // var mycars = ['Herr', 'Frau'];
    // var list = document.getElementById('brow');

    // mycars.forEach(function (item) {
    //   var option = document.createElement('option');
    //   option.value = item;
    //   list.appendChild(option);
    // });


    // articleLinkEl.href = payload.linkReadNow
     titleEl.innerText = payload.title + ' this is random text we are showing by appeding the original one.  ;)';
    titleInputEdit.value = payload.title + "here it comes prevous value "

    // tab-1  Edit Title    action-Edit-Title  [ action-edit1-button1 ]
    //tab-2    Set Labels   action-Set-Labels [ action-edit1-button1 ] 
    // tab-3   Read Now     action-Read-Now [action-edit1-button1] 
    // tab-4    Options     action-Options  [action-edit1-button1 ]  

    //tab-non-Selected
    // tab-Selected



    const labelSelectedTab = document.getElementById('SelectedTab')
    labelSelectedTab.innerText = buttonState

    // tab-1  Edit Title     action-Edit-Title

    var actionEditTitle = document.getElementById("action-Edit-Title");
    var actionSetLabels = document.getElementById("action-Set-Labels");
    var actionReadNow = document.getElementById("action-Read-Now");
    var actionOptions = document.getElementById("action-Options");

    var actionSavedButton = document.getElementById("action-Saved-Button");

    var actionDelete = document.getElementById("action-Delete-Now");
    var actionArchive = document.getElementById("action-Archive-Now");



    var continerTab1 = document.getElementById("tab-1-container");
    var continerTab2 = document.getElementById("tab-2-container");
    var continerTab3 = document.getElementById("tab-3-container");
    var continerTab4 = document.getElementById("tab-4-container");


    var beforeSavedContainer = document.getElementById("BeforeSavedContainer");
    var afterSavedContainer = document.getElementById("AfterSavedContainer");

    beforeSavedContainer.style.display = "block";
    afterSavedContainer.style.display = "none";


  


    actionReadNow.className = 'action-edit1-button1 tab-Selected';
    actionSetLabels .className = 'action-edit1-button1  tab-non-Selected';
    
    actionEditTitle.className = 'action-edit1-button1 tab-non-Selected';
    actionOptions.className = 'action-edit1-button1 tab-non-Selected';

    continerTab1.style.display = "none";
    continerTab2.style.display = "none";
    continerTab3.style.display = "block";
    continerTab4.style.display = "none";


    actionEditTitle.addEventListener("click", function (e) {

      console.log("here it taps ")
      buttonState = "tab-1"
      labelSelectedTab.innerText = buttonState

      actionEditTitle.className = 'action-edit1-button1 tab-Selected';
      actionSetLabels.className = 'action-edit1-button1  tab-non-Selected';
      actionReadNow.className = 'action-edit1-button1 tab-non-Selected';
      actionOptions.className = 'action-edit1-button1 tab-non-Selected';

      continerTab1.style.display = "block";
      continerTab2.style.display = "none";
      continerTab3.style.display = "none";
      continerTab4.style.display = "none";


    }, false);

    //tab-2    Set Labels   action-Set-Labels  actionSetLabels 

    actionSetLabels.addEventListener("click", function (e) {
      // console.log("here it taps ")
      // titleEl.style.color = "red";
      buttonState = "tab-2"
      labelSelectedTab.innerText = buttonState

      actionEditTitle.className = 'action-edit1-button1 tab-non-Selected';
      actionSetLabels.className = 'action-edit1-button1 tab-Selected';
      actionReadNow.className = 'action-edit1-button1 tab-non-Selected';
      actionOptions.className = 'action-edit1-button1 tab-non-Selected';



      continerTab1.style.display = "none";
      continerTab2.style.display = "block";
      continerTab3.style.display = "none";
      continerTab4.style.display = "none";

    }, false);

    // tab-3   Read Now     action-Read-Now actionReadNow

    actionReadNow.addEventListener("click", function (e) {
      buttonState = "tab-3"
      //  titleEl.style.color = "red";
      labelSelectedTab.innerText = buttonState

      actionEditTitle.className = 'action-edit1-button1 tab-non-Selected';
      actionSetLabels.className = 'action-edit1-button1 tab-non-Selected';
      actionReadNow.className = 'action-edit1-button1 tab-Selected';
      actionOptions.className = 'action-edit1-button1 tab-non-Selected';


      continerTab1.style.display = "none";
      continerTab2.style.display = "none";
      continerTab3.style.display = "block";
      continerTab4.style.display = "none";

    }, false);

    // tab-4    Options     action-Options  actionOptions
    actionOptions.addEventListener("click", function (e) {
      buttonState = "tab-4"
      // titleEl.style.color = "red";
      labelSelectedTab.innerText = buttonState
      actionEditTitle.className = 'action-edit1-button1 tab-non-Selected';
      actionSetLabels.className = 'action-edit1-button1 tab-non-Selected';
      actionReadNow.className = 'action-edit1-button1 tab-non-Selected';
      actionOptions.className = 'action-edit1-button1 tab-Selected';

      continerTab1.style.display = "none";
      continerTab2.style.display = "none";
      continerTab3.style.display = "none";
      continerTab4.style.display = "block";

    }, false);

    actionSavedButton.addEventListener("click", function (e) {
      // titleEl.style.color = "red";
      labelSelectedTab.innerText = "Saved button clicked "
      afterSavedContainer.style.display = "block";
      beforeSavedContainer.style.display = "none";

    }, false);


    actionDelete.addEventListener("click", function (e) {

      // titleEl.style.color = "red";
      labelSelectedTab.innerText = "actionDelete clicked "
    }, false);

    actionArchive.addEventListener("click", function (e) {

      // titleEl.style.color = "red";
      labelSelectedTab.innerText = "actionArchive clicked "

    }, false);


    // var buttonArchive = document.getElementById("action-archive-button");
    // buttonArchive.addEventListener("click", function (e) {

    //   console.log("here it taps ")
    //   titleEl.style.color = "gray";


    // }, false);

    // var buttonEdit = document.getElementById("action-edit1-button");
    // buttonEdit.addEventListener("click", function (e) {

    //   console.log("here it taps ")
    //   titleEl.style.color = "green";


    //   var x = document.getElementById("title-container");
    //   var y = document.getElementById("edit-Title-container-id");

    //   if (x.style.display === "none") {
    //     x.style.display = "block";
    //     y.style.display = "none";
    //   } else {
    //     x.style.display = "none";
    //     y.style.display = "block";
    //   }
    // }, false);



  })()

