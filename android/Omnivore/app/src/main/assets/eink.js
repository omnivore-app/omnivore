const container = document.getElementById("root");
const paginationElement = document.getElementById("pagination");
const initialReadingProgress = window.omnivoreArticle.readingProgressPercent;
const articleId = window.omnivoreArticle.id;

let currentPage; // Define currentPage in the global scope
let initialPage; // Define initialPage in the global scope
let totalPages; // Define totalPages in the global scope
let averagedScrollingWidth;
let currentScrollPosition = container.scrollLeft;
let totalWidth;
const safetyMargin = 20;

function calculatePagination() {
    const containerWidth = container.offsetWidth;
    totalWidth = container.scrollWidth - containerWidth;
    console.log("totalWidth:", totalWidth);
    currentScrollPosition = container.scrollLeft;
    totalPages = Math.round((totalWidth + containerWidth) / containerWidth);
    averagedScrollingWidth = Math.ceil(totalWidth + window.innerWidth) / totalPages;
    //averagedScrollingWidth = containerWidth +1;

    console.log("averagedScrollingWidth:", averagedScrollingWidth);
    currentPage = Math.round((container.scrollLeft + averagedScrollingWidth) / averagedScrollingWidth);
    paginationElement.textContent = currentPage + "/" + totalPages;
    checkIfLastPage(currentPage, totalPages);
}

function checkIfLastPage(currentPage, totalPages) {
    if (currentPage === totalPages) {
        document.getElementById('buttonWrapper').style.display = 'flex';
    } else {
        document.getElementById('buttonWrapper').style.display = 'none';
    }
}

function scrollToInitialPage() {
    // Calculate the initial page based on the initialReadingProgress
    initialPage = Math.ceil((initialReadingProgress / 100) * totalPages);
    // Scroll to the initial page
    container.scrollLeft = (initialPage - 1) * averagedScrollingWidth;
    calculatePagination()
    setToolbar(false);
}

function calculateAndLogReadingProgress() {
    // Calculate the reading progress from the leftmost position
    currentScrollPosition = container.scrollLeft;
    const newReadingProgress = Math.round((currentScrollPosition / totalWidth) * 100);
    console.log("currentScrollPosition:", container.scrollLeft);
    console.log("readingProgressDB:", initialReadingProgress);
    console.log("Local Reading Progress:", newReadingProgress);

    function updateReadingProgressOnAndroid(articleId, readingProgressPercent, readingProgressTopPercent, readingAnchorIndex) {
        // Check if the Android interface is available
        if (window.AndroidWebKitMessenger) {
            // Construct the data object
            const data = {
                id: articleId,
                readingProgressPercent: readingProgressPercent,
                readingProgressTopPercent: readingProgressTopPercent,
                readingProgressAnchorIndex: !isNaN(readingAnchorIndex) ? readingAnchorIndex : undefined
            };

            // Convert the data object to a JSON string
            const jsonString = JSON.stringify(data);

            // Log the data being sent
            console.log("Sending reading progress to Android layer:", data);

            // Send the message to the Android layer
            window.AndroidWebKitMessenger.handleIdentifiableMessage("articleReadingProgress", jsonString);

            // Log the successful sending of the message
            console.log("Message sent to Android layer successfully.");
        } else {
            // Log an error if the Android interface is not available
            console.error("AndroidWebKitMessenger interface is not available.");
        }
    }

    updateReadingProgressOnAndroid(articleId, newReadingProgress, 0, 0);

}

function scrollForward() {


        if (container.scrollLeft < (totalWidth - safetyMargin) ) {
               nextScrollPosition = (currentPage)*averagedScrollingWidth
                container.scrollLeft = nextScrollPosition
                console.log("next Scroll Position", nextScrollPosition);
                console.log("scrolling by:", averagedScrollingWidth);
                console.log("totalWidth:", totalWidth);
                calculatePagination();
                setToolbar(false);
                calculateAndLogReadingProgress();
    } else {
        setToolbar(true);
}

}

function scrollBack() {
        if (container.scrollLeft > safetyMargin) {
    nextScrollPosition = (currentPage - 2) * averagedScrollingWidth
    container.scrollLeft = nextScrollPosition
    console.log("next Scroll Position", nextScrollPosition);
    calculatePagination();
    setToolbar(false);
    calculateAndLogReadingProgress();
    } else {
        // Set the toolbar when trying to scroll beyond the leftmost position
        setToolbar(true);
}


}

function setToolbar(showToolbar) {
    // Show or hide the toolbar based on the boolean input and page position
    if (showToolbar || currentPage === 1) {
        updateToolbarHeightFromJS(100);
    } else {
        updateToolbarHeightFromJS(0);
    }
}



function updateToolbarHeightFromJS(height) {
    if (typeof ToolbarHeightInterface !== 'undefined') {
        ToolbarHeightInterface.updateToolbarHeight(height);
    }
}

// Initial call to set up pagination and scroll to the initial page
document.addEventListener("DOMContentLoaded", function() {
    calculatePagination()
    scrollToInitialPage();
    document.getElementById('preloader').style.display = 'none';
    //calculateAndLogReadingProgress();
});



// Short tap handling
let tapStartTime;

// Tap handling
function handleTap(e) {

    // Get tap duration
    const tapDuration = new Date().getTime() - tapStartTime;

    // Only handle short taps
    if (tapDuration > 250) return;

    // Get tap position
    const tapX = e.changedTouches[0].clientX;
    const tapY = e.changedTouches[0].clientY;


    // Check vertical position
    if (tapY < document.body.clientHeight * 0.2) {
        // Tap is in the top 10% of the screen
        setToolbar(true);
        console.log("tap in top 10% of screen");
    } else {
        // Check horizontal position
        if (tapX < document.body.clientWidth / 2) {
            // Handle left side tap
            scrollBack();
        } else {
            // Handle right side tap
            scrollForward();
        }
    }

}

// Add passive tap listener
document.addEventListener('touchend', handleTap, {
    passive: true
});

// Update start time on touch start
document.addEventListener('touchstart', e => {
    tapStartTime = new Date().getTime();
});


// Swipe gestures for scrolling
let touchStartX = null;
let touchStartY = null;

document.addEventListener(
    "touchstart",
    function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    },
    false
);

document.addEventListener(
    "touchmove",
    function(event) {
        event.preventDefault();
    }, {
        passive: false
    }
);

document.addEventListener(
    "touchend",
    function(event) {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX < -50) {
                // Swipe left
                scrollForward();
            } else if (diffX > 50) {
                // Swipe right
                scrollBack();
            }
        } else {
            // Vertical swipe
            if (diffY < -50) {
                scrollForward();
            } else if (diffY > 50) {
                scrollBack();
            }
        }
    },
    false
);


function performSavedItemAction(actionType) {
  AndroidItemAction.performItemAction(articleId, actionType);
  console.log(`${actionType} JS script`);
}





