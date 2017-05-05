const Urls = {
  TASTEDIVE: "https://tastedive.com/api/similar?callback=?",
  YOUTUBE: "https://www.googleapis.com/youtube/v3/search?callback=?",
  WIKIPEDIA: "https://en.wikipedia.org/w/api.php?callback=?"
};

const ApiKeys = {
  YOUTUBE: "AIzaSyARf9WqTP8LDmnUhPWkdqLc0YuYBVVOk2M",
  TASTEDIVE: "268947-MichaelA-E3LYSMFS"
};

const all = "All";
// combine urls into one object first letter of Object is caps, properties all caps, sep by underscore if space
//make an object of your keys, limits const object (API KEYS object, youbtube property)
// strings used in code, define as const at top

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
    state.type = interestType === all ? null : interestType.toLowerCase();
};

const getDataFromWikipediaApi = (searchFor, callback) => {
    let query = {
        action: "query",
        titles: searchFor,
        format: "json",
        prop: "images"
  };
  $.getJSON(Urls.WIKIPEDIA, query, callback);
};


const getDataFromYoutubeApi = (searchFor, callback, page) => {
    let query = {
        part: "snippet",
        key:  ApiKeys.YOUTUBE,
        q: searchFor,
        pageToken: page,
        maxResults: 5
    };

    $.getJSON(Urls.YOUTUBE, query, callback);
};

const getDataFromTasteDiveApi = (searchFor, searchType, callback) => {
    let query = {
        type: searchType,
        k: ApiKeys.TASTEDIVE,
        q: searchFor,
        limit: 100,
        info: 1
    };

    $.getJSON(Urls.TASTEDIVE, query, callback);
};

const getFormatedHtmlForYouTubeResults = ele => {
  return `<img class="thumbs" src="${ele.snippet.thumbnails.medium.url}">
              <div class="iFrame hide">
                  <iframe width="350" height="250" src="http://www.youtube.com/embed/${ele.id.videoId}"  frameborder="0" allowfullscreen></iframe><br>
                  <button type="button" class="back">Back</button>
              </div>
              <p class="channel">
                  <a href="https://www.youtube.com/channel/${ele.snippet.channelId}">Watch More Videos from the Channel ${ele.snippet.channelTitle}</a>
              </p>`;
}

const displayYouTubeData = data => {
    assignNewPageTokens(data)
    console.log("woops")
    $('.youtube-heading').html(`Youtube Videos for the search term "${state.search}"`)

    if (data.items) {
        const resultElements = data.items.map(ele => {
            return getFormatedHtmlForYouTubeResults(ele)
        });
    $('.youtube-video-results').append(resultElements);
    }
    else {
    $('.youtube-video-results').append("No Results");
    }
};

const updateNoResultLanguage = (span1, span2) => {
  span1.text(state.type.toUpperCase());
  span2.text(state.search.toUpperCase());
};

const displayNoResultsInConfPage = ()=> {
      $(".no-results-for-refine").removeClass("hide")
      $(".no-results").removeClass("hide");
      $(".conf-results-container").addClass("hide")
      updateNoResultLanguage($(".no-type-result"), $(".no-term-result"));
};

const displayResultsInConfPage = () => {
    $(".search-page").addClass("hide");
    $(".no-results-for-refine").addClass("hide");
    $(".result-confirmation-page").removeClass("hide");
    $(".conf-results-container").removeClass("hide");
};

const displayInfoInResultsPage = data => {
    const { wUrl, wTeaser, Name, Type } = data.Similar.Info[0]
    $(".wiki-link").attr("href", wUrl);
    $(".info-image").attr("src", "https://pixy.org/images/placeholder.png")
    $(".info-summary").prepend(`${wTeaser} `);
    $(".name-of-interest").text(Name.toUpperCase());
    $(".type-of-interest").text(Type.toUpperCase());
};

const displayTasteDiveData = data => {
    if (!data.Similar.Results.length) {
        displayNoResultsInConfPage();
    }
    else {
        state.result = data.Similar.Results;
        displayResultsInConfPage();
        displayInfoInResultsPage(data);
    };
console.log(data)
console.log(state.type);
};


// one or two more features
const displayDataFromWiki = data => {
  console.log("wiki", data)
}

const renderResultsToResultsPage = () => {
    const listOfResultsElement = state.result.map((ele, index) => {
        return `<img class="result-thumbs" src="https://pixy.org/images/placeholder.png" data-index="${index}"><p class="results">Result Name: ${ele.Name.toUpperCase()} <br> Type: ${ele.Type.toUpperCase()}</p>`
    });
    $(".result-list").html(listOfResultsElement);
};


const renderRefinedResultsToResultsPage = data => {
    if (!data.Similar.Results.length) {
        $(".no-refined-results").removeClass("hide");
        $(".results-container").addClass("hide")
        updateNoResultLanguage($(".no-type-result"), $(".no-term-result"))

    }
    else {
        $(".no-refined-results").addClass("hide");
        $(".results-container").removeClass("hide");

        state.result = data.Similar.Results;
        renderResultsToResultsPage();
    //     //call renderResultsToResultsPage
    //     listOfResultsElement = state.result.map(ele => {
    //         dataAttrib++
    //         return `<img class="result-thumbs" src="https://pixy.org/images/placeholder.png" data-index="${dataAttrib}"><p class="results">Result Name: ${ele.Name.toUpperCase()}<br> Type: ${ele.Type.toUpperCase()}</p>`
    //     });
    //     $(".result-list").html(listOfResultsElement)
     };
};

const renderResultInfo = index => {
    const infoHtml = `<p class ="index-p" data-indexnum="${index}">More Info About ${state.result[index].Name}<p><br><p>${state.result[index].wTeaser}<a href="${state.result[index]}">Read More</a><div class="iFrame"><iframe width="350" height="250" src="http://www.youtube.com/embed/${state.result[index].yID}"  frameborder="0" allowfullscreen></iframe><br><button type="button" class="back-to-result-list">Go back to more like ${state.search}!</button><button type="button" class="find-more-like-new-topic">Find MORE like ${state.result[index].Name}!</button>`
    $(".info-container").html(infoHtml)
};


const watchForSearchClick = () => {
    $('.js-search-form').on("click", ".search-button", event => {
        event.preventDefault();

        let typeOfInterest = $(event.target).val();
        updateStateType(typeOfInterest);

        state.search = $(".search-field").val();  //change to state.searchQuery - more descript

        getDataFromTasteDiveApi(state.search, state.type, displayTasteDiveData);
        getDataFromYoutubeApi(state.search, displayYouTubeData)
        getDataFromWikipediaApi(state.search, displayDataFromWiki)

        $('.youtube-video-results').html("");
      });
};

const watchForRefinedSearchClick = () => {
    $('.js-new-search-form').on("click", ".search-button", event => {
        event.preventDefault();
        $(".info-container").addClass("hide");

        let typeOfInterest= $(event.target).val();
        updateStateType(typeOfInterest);

        getDataFromTasteDiveApi(state.search, state.type, renderRefinedResultsToResultsPage)
        $(window).scrollTop(0)
    });
};

const watchForANewSearchClick = ()=> {
    $(".info-container").on("click", ".find-more-like-new-topic", event => {
        $(".info-container").addClass("hide");

        let index = $(event.target).closest(".info-container")
                                   .find(".index-p")
                                   .attr("data-indexnum")

        state.search = state.result[index].Name;

        getDataFromTasteDiveApi(state.search, state.result[index].Type, renderRefinedResultsToResultsPage)
    });
};

const watchForGoToResultsPageClick = () => {
    $(".go-to-results-button").on("click", event => {
        $(".results-page").removeClass("hide");
        $(".info-container").addClass("hide");
        $(".search-container").addClass("hide");
        $(".result-confirmation-page").addClass("hide");


        renderResultsToResultsPage();

        $(window).scrollTop(0)
    });
};

const watchForGoBackToResultsClick = () => {
    $(".info-container").on("click", ".back-to-result-list", event => {
        $(".more-results").removeClass("hide");
        $(".result-thumbs").removeClass("hide");
        $(".results").removeClass("hide");
        $(".info-container").html("");
    });
};

const watchForPrevButtonClick = () => {
    $(".prev-button").on("click", event  => {
      $(".results-page").addClass("hide")
      $(".result-confirmation-page").removeClass("hide");
    });
};

const watchForReturnHomeClick = () => {
    $(".return-home-button").on("click", event => {
        $(".search-page").removeClass("hide")
        $(".results-page").addClass("hide")
        $(".result-confirmation-page").addClass("hide");
        $(".no-results").addClass("hide");
        $(".search-field").val("");
    });
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
//seperate into two functions


const watchForMoreYoutubeVideosClick = () => {
    $("body").on("click", ".more", event => {
        getDataFromYoutubeApi(state.search, displayYouTubeData, state.nextPageToken);
    });
};

const watchForMoreInfoClick = () => {
     $(".result-list").on("click", ".result-thumbs", event => {
          $(".info-container").removeClass("hide");
          $(".more-results").addClass("hide");
          $(".result-thumbs").addClass("hide");
          $(".results").addClass("hide");
          $(event.target).removeClass("hide");
          $(event.target).next(".results").removeClass("hide");

          let indexNum = (parseInt($(event.target).attr("data-index")) - 1);
          renderResultInfo(indexNum);
    });
};


// const watchForMoreResultsClick = () => {
//     $(".more-results").on("click", event => {
//         getDataFromTasteDiveApi(state.search, state.type, renderMoreResults)
//     });

const init = () => {
    watchForSearchClick();
    watchForRefinedSearchClick();
    watchForANewSearchClick();

    watchForGoToResultsPageClick();
    watchForGoBackToResultsClick();
    watchForReturnHomeClick();
    watchForPrevButtonClick();

    watchForEmbedClicks();
    watchForMoreYoutubeVideosClick();

    watchForMoreInfoClick();
}

$(init);
