const tasteDiveURL = "https://tastedive.com/api/similar?callback=?"
const youtube_URL = "https://www.googleapis.com/youtube/v3/search?callback=?"
const wikipediaURL = "https://en.wikipedia.org/w/api.php"

let state = {
    search: null,
    type: null,
    nextPage: null,
    prevPage: null
  };

  const assignNewPageTokens = (data) => {
    state = Object.assign({}, state, {
    nextPageToken: data.nextPageToken,
    prevPageToken: data.prevPageToken
  })
  };


const updateStateType = (interestType) => {

    if(interestType === "All") {
        state.type = null
    }
    else if(interestType === "Movies") {
        state.type = "movies"
    }
    else if(interestType === "Shows") {
        state.type = "shows"
    }
    else if(interestType === "Music") {
        state.type = "music"
    }
    else if(interestType === "Books") {
        state.type = "books"
    }
    else if(interestType=== "Authors") {
        state.type = "authors"
    }
    else if(interestType === "Games") {
        state.type = "games"
    }
};

// const getDataFromWikipediaApi = (searchFor, callback) => {
//   let query = {
//     action: "query",
//     titles: searchFor,
//     headers: { "Api-user-agent": "mallain23"},
//     prop: "images"
//   };
//   $.getJSON(wikipediaURL, query, callback);
// };

const getDataFromYoutubeApi = (searchFor, callback, page) => {
    let query = {
        part: "snippet",
        key: "AIzaSyARf9WqTP8LDmnUhPWkdqLc0YuYBVVOk2M",
        q: searchFor,
        pageToken: page,
        maxResults: 10
    };

    $.getJSON(youtube_URL, query, callback);
};

const getDataFromTasteDiveApi = (searchFor, searchType, callback) => {
    let query = {
        type: searchType,
        k: "268947-MichaelA-E3LYSMFS",
        q: searchFor,
        info: 1
    };

    $.getJSON(tasteDiveURL, query, callback);
};

const displayYouTubeData = (data) => {
    let resultElement = '';
    if (data.items) {
        data.items.forEach(ele => {
            resultElement += `<img class="thumbs" src="${ele.snippet.thumbnails.medium.url}"><div class="iFrame hide"><iframe width="640" height="350" src="http://www.youtube.com/embed/${ele.id.videoId}"  frameborder="0" allowfullscreen></iframe><br><button type="button" class="back">Back</button></div><p class="channel"><a href="https://www.youtube.com/channel/${ele.snippet.channelId}">Watch More Videos from the Channel ${ele.snippet.channelTitle}</a></p>`;
        });
    }
    else {
      resultElement += '<p>No results</p>';
    }
    $('.youtube-video-results').html(resultElement);
};


const displayTasteDiveData = data => {
    if (data.Similar.Results.length === 0) {
        $(".no-results-page").removeClass("hide")
    }
    else {
      $(".result-confirmation-page").removeClass("hide");
      getDataFromYoutubeApi(state.search, displayYouTubeData)
    }

console.log(data)

};




const watchForSearchSubmit = () => {
    $('.js-search-form').on("click", ".search-button", event => {
    event.preventDefault();

    $(".search-page").addClass("hide");

    let typeOfInterest= $(event.target).val();
    updateStateType(typeOfInterest);
    state.search = $(".search-field").val();

    getDataFromTasteDiveApi(state.search, state.type, displayTasteDiveData);
    //  getDataFromWikipediaApi(state.search, displayYoutubeSearchData)
  });
}

const watchForTryAgainClick = () => {
  $(".no-results-page").on("click", ".return-home-button", event => {
        $(".no-results-page").addClass("hide");
        $(".search-page").removeClass("hide");
        $(".search-field").val("");
  })
}

const watchForEmbedClicks = () => {
    $(".youtube-video-results").on("click", ".thumbs", event => {
          $(".iFrame").addClass("hide");
          $(".thumbs").removeClass("hide");
          $(event.target).next(".iFrame").removeClass("hide")
         $(event.target).addClass("hide");
    });
     $(".youtube-video-results").on("click", ".back", event => {
             $(".thumbs").removeClass("hide");
             $(".iFrame").addClass("hide");
    })
}

const init = () => {
    watchForSearchSubmit();
    watchForTryAgainClick();
    watchForEmbedClicks();
}

$(init);
