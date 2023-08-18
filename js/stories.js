"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  // console.log("generateSToryMarkup ", story);
  const hostName = story.getHostName();

  const isFavorite = currentUser?.favorites.some(fav => fav.storyId === story.storyId);

  return $(`
      <li id="${story.storyId}">
      <i class="star bi bi-star${isFavorite ? "-fill" : ""}
        ${currentUser ? "" : "hidden"}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** getFormDataAndDisplayStory: Get input values from new story form, update API
 *  with new story, and display new story to DOM
 *
 */

async function getFormDataAndDisplayStory() {
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();

  const newStory = await storyList.addStory(currentUser, { author, title, url });

  const $storyMarkup = generateStoryMarkup(newStory);

  $allStoriesList.prepend($storyMarkup);
}

$("#new-story-form").on("submit", function (evt) {
  evt.preventDefault();
  getFormDataAndDisplayStory();

  $("#new-story-submit").trigger("reset");
});


function putUserFavoritesOnPage() {
  $(".list-of-favorites").empty();
  $("#no-favorites").hide();

  const currentUserFavorites = currentUser.favorites;
  if (currentUserFavorites.length === 0) {
    $("#no-favorites").show();
    return;
  }

  for (let favorite of currentUserFavorites) {
    const $favoriteMarkup = generateStoryMarkup(favorite);
    $(".list-of-favorites").append($favoriteMarkup);
  }
}


/** displayFavorite: takes in a story instance, creates markup, and appends
 * to the LIST OF FAVORITES
 */

// function displayFavorite(story) {
//   const $favoriteMarkup = generateStoryMarkup(story);
//   $(".list-of-favorites").append($favoriteMarkup);
// }


// FAV STAR EVENT LISTENER!

$(".stories-container").on("click", ".star", async function (evt) {
  $(evt.target).toggleClass("bi-star bi-star-fill");

  const storyId = $(evt.target).parent().attr("id");

  const clickedStory = await Story.getStoryById(storyId);

  if ($(evt.target).hasClass("bi-star")) {
    await currentUser.removeFavorite(clickedStory);
  } else {
    await currentUser.addFavorite(clickedStory);
  }
});
