'use strict'
  ; (function () {
    // This gets the link of the iframe -> then it returns [key, values] -> fromEntries method will return the object
    const payload = Object.fromEntries([
      ...new URL(window.location.href).searchParams.entries(),
    ])

     const titleEl = document.getElementById('article-title')
     var titleInputEdit = document.getElementById("article-title-edit");

     titleEl.innerText = payload.title
    titleInputEdit.value = payload.title + "here it comes prevous value "

    // tab-1  Edit Title    action-Edit-Title  [ action-button-layout ]
    //tab-2    Set Labels   action-Set-Labels [ action-button-layout ] 
    // tab-3   Read Now     action-Read-Now [action-button-layout] 
    // tab-4    Options     action-Options  [action-button-layout ]  

    //tab-non-Selected
    // tab-Selected



    const labelSelectedTab = document.getElementById('SelectedTab')
    

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


  


    actionReadNow.className = 'action-button-layout tab-Selected';
    actionSetLabels .className = 'action-button-layout  tab-non-Selected';
    
    actionEditTitle.className = 'action-button-layout tab-non-Selected';
    actionOptions.className = 'action-button-layout tab-non-Selected';

    continerTab1.style.display = "none";
    continerTab2.style.display = "none";
    continerTab3.style.display = "block";
    continerTab4.style.display = "none";


    actionEditTitle.addEventListener("click", function (e) {

      console.log("here it taps ")
  

      actionEditTitle.className = 'action-button-layout tab-Selected';
      actionSetLabels.className = 'action-button-layout  tab-non-Selected';
      actionReadNow.className = 'action-button-layout tab-non-Selected';
      actionOptions.className = 'action-button-layout tab-non-Selected';

      continerTab1.style.display = "block";
      continerTab2.style.display = "none";
      continerTab3.style.display = "none";
      continerTab4.style.display = "none";


    }, false);

    //tab-2    Set Labels   action-Set-Labels  actionSetLabels 

    actionSetLabels.addEventListener("click", function (e) {
      // console.log("here it taps ")
 
      actionEditTitle.className = 'action-button-layout tab-non-Selected';
      actionSetLabels.className = 'action-button-layout tab-Selected';
      actionReadNow.className = 'action-button-layout tab-non-Selected';
      actionOptions.className = 'action-button-layout tab-non-Selected';



      continerTab1.style.display = "none";
      continerTab2.style.display = "block";
      continerTab3.style.display = "none";
      continerTab4.style.display = "none";

    }, false);

    // tab-3   Read Now     action-Read-Now actionReadNow

    actionReadNow.addEventListener("click", function (e) {
    

      actionEditTitle.className = 'action-button-layout tab-non-Selected';
      actionSetLabels.className = 'action-button-layout tab-non-Selected';
      actionReadNow.className = 'action-button-layout tab-Selected';
      actionOptions.className = 'action-button-layout tab-non-Selected';


      continerTab1.style.display = "none";
      continerTab2.style.display = "none";
      continerTab3.style.display = "block";
      continerTab4.style.display = "none";

    }, false);

    // tab-4    Options     action-Options  actionOptions
    actionOptions.addEventListener("click", function (e) {

      actionEditTitle.className = 'action-button-layout tab-non-Selected';
      actionSetLabels.className = 'action-button-layout tab-non-Selected';
      actionReadNow.className = 'action-button-layout tab-non-Selected';
      actionOptions.className = 'action-button-layout tab-Selected';

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

