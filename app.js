const tasteDiveURL = "https://tastedive.com/api/similar?callback=?"
const youtube_URL = "https://www.googleapis.com/youtube/v3/search?callback=?"
const wikipediaURL = "https://en.wikipedia.org/w/api.php?callback=?"

let state = {
    search: null,
    type: null,
    nextPage: null,
    result: null,
    prevPage: null
  };


const assignNewPageTokens = (data) => {
      state = Object.assign({}, state, {
          nextPageToken: data.nextPageToken,
          prevPageToken: data.prevPageToken
      })
};

const updateStateType = (interestType) => {
    state.type = interestType === "All" ? null : interestType.toLowerCase();
};
// let settings = {
//    url: wikipediaURL,
//    data: {
//      action: "query",
//      titles: searchFor,
//      prop: "images"
//    },
//    dataType: 'json',
//    type: 'GET',
//    success: callback
//  };
//  $.ajax(settings)

const getDataFromWikipediaApi = (searchFor, callback) => {
    let query = {
        action: "query",
        titles: searchFor,
        prop: "images"
  };
  $.getJSON(wikipediaURL, query, callback);
};


const getDataFromYoutubeApi = (searchFor, callback, page) => {
    let query = {
        part: "snippet",
        key: "AIzaSyARf9WqTP8LDmnUhPWkdqLc0YuYBVVOk2M",
        q: searchFor,
        pageToken: page,
        maxResults: 5
    };

    $.getJSON(youtube_URL, query, callback);
};

const getDataFromTasteDiveApi = (searchFor, searchType, callback) => {
    let query = {
        type: searchType,
        k: "268947-MichaelA-E3LYSMFS",
        q: searchFor,
        limit: 5,
        info: 1
    };

    $.getJSON(tasteDiveURL, query, callback);
};

const displayYouTubeData = (data) => {
    let resultElement = '';
    if (data.items) {
        data.items.forEach(ele => {
            resultElement += `<img class="thumbs" src="${ele.snippet.thumbnails.medium.url}"><div class="iFrame hide"><iframe width="350" height="250" src="http://www.youtube.com/embed/${ele.id.videoId}"  frameborder="0" allowfullscreen></iframe><br><button type="button" class="back">Back</button></div><p class="channel"><a href="https://www.youtube.com/channel/${ele.snippet.channelId}">Watch More Videos from the Channel ${ele.snippet.channelTitle}</a></p>`;
        });
    }
    else {
      resultElement += '<p>No results</p>';
    }

    assignNewPageTokens(data)
    $('.youtube-heading').html(`Youtube Videos for the search term "${state.search}"`)
    $('.youtube-video-results').append(resultElement);
};


const displayTasteDiveData = data => {
    if (data.Similar.Results.length === 0) {
        $(".no-results").removeClass("hide")
    }
    else {
        $(".search-page").addClass("hide");
        state.result = data.Similar.Results;
        $(".result-confirmation-page").removeClass("hide");

        getDataFromYoutubeApi(state.search, displayYouTubeData);
        console.log(state.result)


        $(".wiki-link").attr("href", data.Similar.Info[0].wUrl);
        $(".info-image").attr("src", "https://pixy.org/images/placeholder.png")
        $(".info-summary").prepend(`${data.Similar.Info[0].wTeaser} `);
        $(".name-of-interest").text(data.Similar.Info[0].Name)
    };
console.log(data)
};

const displayDataFromWiki = data => {
  console.log("wiki", data)
}

const renderHtmlToResultsPage = (data) => {
    if (data) {
        state.result = data.Similar.Results;

        $(".no-refined-results").addClass("hide");
        $(".results-container").removeClass("hide");

        let listOfResultsElement = "";
        let dataAttrib = 0;

        listOfResultsElement = state.result.map(ele => {
            dataAttrib++
            return `<img class="result-thumbs" src="https://pixy.org/images/placeholder.png" data-index="${dataAttrib}"><p class="results">Result Name: ${ele.Name.toUpperCase()}<br> Type: ${ele.Type.toUpperCase()}</p>`
        });

        if (listOfResultsElement.length === 0) {
            listOfResultsElement = `Sorry, there are no ${state.type.toUpperCase()} for the search term ${state.search.toUpperCase()}! </h2><p>Try a different category or redfine your search!</p>`

            $(".no-results-language").html(listOfResultsElement);
            $(".no-refined-results").removeClass("hide");
            $(".results-container").addClass("hide")
          }
        else {
            $(".result-list").html(listOfResultsElement)
        }
    }
    else {
        let listOfResultsElement = "";
        let dataAttrib = 0

        listOfResultsElement = state.result.map(ele => {
            dataAttrib++
            return `<img class="result-thumbs" src="https://pixy.org/images/placeholder.png" data-index="${dataAttrib}"><p class="results">Result Name: ${ele.Name.toUpperCase()} <br> Type: ${ele.Type.toUpperCase()}</p>`
        });
    $(".result-list").html(listOfResultsElement);
    };
};


const renderInfo = (index) => {
    let infoHtml = ""
    infoHtml = `<p class ="index-p" data-indexnum="${index}">More Info About ${state.result[index].Name}<p><br><p>${state.result[index].wTeaser}<a href="${state.result[index]}">Read More</a><div class="iFrame"><iframe width="350" height="250" src="http://www.youtube.com/embed/${state.result[index].yID}"  frameborder="0" allowfullscreen></iframe><br><button type="button" class="back-to-result-list">Go back to more like ${state.search}!</button><button type="button" class="find-more-like-new-topic">Find MORE like ${state.result[index].Name}!</button>`
    $(".info-container").html(infoHtml)
};


const watchForSearchSubmit = () => {
    $('.js-search-form').on("click", ".search-button", event => {
    event.preventDefault();

    let typeOfInterest = $(event.target).val();
    updateStateType(typeOfInterest);

    state.search = $(".search-field").val();

    getDataFromTasteDiveApi(state.search, state.type, displayTasteDiveData);
    $('.youtube-video-results').html("");
    getDataFromWikipediaApi(state.search, displayDataFromWiki)
  });
}

const watchForRefinedSearchSubmit = () => {
    $('.js-new-search-form').on("click", ".search-button", event => {
        event.preventDefault();
        $(".info-container").addClass("hide");

        let typeOfInterest= $(event.target).val();

        updateStateType(typeOfInterest);
        getDataFromTasteDiveApi(state.search, state.type, renderHtmlToResultsPage)
        $(window).scrollTop(0)
    })
};


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

const watchForMoreYoutubeVideosClick = () => {
    $("body").on("click", ".more", event => {
        getDataFromYoutubeApi(state.search, displayYouTubeData, state.nextPageToken);
    });
}

const watchForReturnHomeClick = () => {
    $(".return-home-button").on("click", event => {
        $(".search-page").removeClass("hide")
        $(".results-page").addClass("hide")
        $(".result-confirmation-page").addClass("hide");
        $(".no-results").addClass("hide");
        $(".search-field").val("");
    })
};

const watchForGoToResultsPageClick = () => {
    $(".go-to-results-button").on("click", event => {
        $(".results-page").removeClass("hide")
        $(".info-container").addClass("hide")
        $(".result-confirmation-page").addClass("hide");

        renderHtmlToResultsPage ();

        $(window).scrollTop(0)
    })
};

const watchForMoreInfoClick = () => {
     $(".result-list").on("click", ".result-thumbs", event => {
          $(".info-container").removeClass("hide");
          $(".more-results").addClass("hide");
          $(".result-thumbs").addClass("hide");
          $(".results").addClass("hide");
          $(event.target).removeClass("hide");
          $(event.target).next(".results").removeClass("hide");

          let indexNum = (parseInt($(event.target).attr("data-index")) -1 );
          renderInfo(indexNum);
    })
};

const watchForGoBackToResultsClick = () => {
    $(".info-container").on("click", ".back-to-result-list", event => {
        $(".more-results").removeClass("hide");
        $(".result-thumbs").removeClass("hide");
        $(".results").removeClass("hide");
        $(".info-container").html("");
    })
};

const watchForPrevButtonClick = () => {
    $(".prev-button").on("click", event  => {
      $(".results-page").addClass("hide")
      $(".result-confirmation-page").removeClass("hide");
    })
};

const watchForANewSearchTermClick = ()=> {
    $(".info-container").on("click", ".find-more-like-new-topic", event => {
        $(".info-container").addClass("hide");

        let index = $(event.target).closest(".info-container").find(".index-p").attr("data-indexnum")
        state.search = state.result[index].Name;

        getDataFromTasteDiveApi(state.search, state.result[index].Type, renderHtmlToResultsPage)
    })
}

// const watchForMoreResultsClick = () => {
//     $(".more-results").on("click", event => {
//         getDataFromTasteDiveApi(state.search, state.type, renderMoreResults)
//     });

const init = () => {
    watchForSearchSubmit();
    watchForRefinedSearchSubmit();
    watchForReturnHomeClick();
    watchForEmbedClicks();
    watchForMoreYoutubeVideosClick();
    watchForGoToResultsPageClick();
    watchForPrevButtonClick();
    watchForMoreInfoClick();
    watchForGoBackToResultsClick();
    watchForANewSearchTermClick();
}

$(init);
