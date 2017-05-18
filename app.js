const Urls = {
  TASTEDIVE: "https://tastedive.com/api/similar?callback=?",
  YOUTUBE: "https://www.googleapis.com/youtube/v3/search?callback=?",
  WIKIPEDIA: `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=`
};

const ApiKeys = {
  YOUTUBE: "AIzaSyARf9WqTP8LDmnUhPWkdqLc0YuYBVVOk2M",
  TASTEDIVE: "268947-MichaelA-E3LYSMFS"
};

const all = "All";

let sliceIndex = 0;

const maxResults = 5;

const tasteDiveQueryLimit = 100;

const classReferences = {
    no_results_for_refine: ".no-results-for-refine",
    no_results: ".no-results",
    conf_results_container: ".conf-results-container",
    search_page: ".search-page",
    result_confirmation_page: ".result-confirmation-page",
    info_container: ".info-container",
    js_search_form: ".js-search-form",
    js_new_search_form: ".js-new-search-form",
    more_results: ".more-results",
    results_page: ".results-page",
    search_container: ".search-container",
    result_thumbs: ".result-thumbs",
    results: ".results",
    results_page: ".results-page",
    iFrame: ".iFrame",
    thumbs: ".thumbs",
    resturn_home_button: ".return-home-button",
    youtube_video_results: ".youtube-video-results",
    results_container: ".results-container",
    no_refined_results: ".no-refined-results",
    result_button: ".result-button",
    youtube_channel_links: ".youtube-channel-links",
    more: ".more",
    result_list: ".result-list",
    prev_button: ".prev-button",
    page_number: ".page-number"
};

let state = {
      searchQuery: null,
      type: null,
      nextPage: null,
      result: null,
      prevPage: null,
      wikiPicsForResults: [],
      Result_Info: null
  };

  const resetState = (typeOfInterest) => {
      state.wikiPicsForResults = [];
      state.type = typeOfInterest === all ? null : typeOfInterest.toLowerCase();

      addAndRemoveClasses([classReferences.iFrame], [classReferences.thumbs, classReferences.youtube_channel_links, classReferences.more])
      sliceIndex = 0;

      $(window).scrollTop(0)
};

const resetConfirmationPageResults = () => {
    $(".info-summary").text("");
    $('.youtube-video-results').html("");
};

const assignNewPageTokens = (data) => {
      state = Object.assign({}, state, {
          nextPageToken: data.nextPageToken,
          prevPageToken: data.prevPageToken
      })
};

const addAndRemoveClasses = (addArray, removeArray) => {
    addArray.forEach(ele => {
        $(ele).addClass("hide");
    })
    removeArray.forEach(ele => {
        $(ele).removeClass("hide");
    })
};


const getDataFromWikipediaApi = (searchFor, callback) => {
 return $.ajax({
    url: `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=250&pilimit=20&wbptterms=description&gpssearch=${searchFor}&gpslimit=20`,
    method: "GET",
    dataType: "jsonp",
    success: callback
  })
}

const getDataFromYoutubeApi = (searchFor, callback, page) => {
    let query = {
        part: "snippet",
        key:  ApiKeys.YOUTUBE,
        q: searchFor,
        pageToken: page,
        maxResults: maxResults
    };

    $.getJSON(Urls.YOUTUBE, query, callback);
};

const getDataFromTasteDiveApi = (searchFor, searchType, callback) => {
    let query = {
        type: searchType,
        k: ApiKeys.TASTEDIVE,
        q: searchFor,
        limit: tasteDiveQueryLimit,
        info: 1
    };

    $.getJSON(Urls.TASTEDIVE, query, callback);
};

const getFormatedHtmlForYouTubeResults = ele => {
    return (
          `<img class="thumbs" src="${ele.snippet.thumbnails.default.url}">
           <div class="iFrame hide">
              <iframe class="iFrame-box" width="250px" height="200px" src="http://www.youtube.com/embed/${ele.id.videoId}"  frameborder="0" allowfullscreen></iframe><br>
              <button type="button" class="back">Back</button>
           </div>
           <p class="channel">
              <a class="youtube-channel-links" href="https://www.youtube.com/channel/${ele.snippet.channelId}">Watch More Videos from the Youtube Channel ${ele.snippet.channelTitle}</a>
           </p>`
    );
}

const displayYouTubeData = data => {
    assignNewPageTokens(data);
    console.log(data)
    if (!data.items) {
        $('.youtube-video-results').append("No Results");
        return;
    }

    const resultElements = data.items.map(ele => getFormatedHtmlForYouTubeResults(ele));
    $('.youtube-video-results').append(resultElements);
};


const updateNoResultLanguage = (span1, span2) => {
    span1.text(state.type.toUpperCase());
    span2.text(state.searchQuery.toUpperCase());
};

const storeWikiThumbnails = data => {
    if (!data.query) {
      displayNoResultsInConfirmationPage
      return
    }
    state.confirmationpage_wiki_info = data.query.pages.find(ele => ele.index === 1);
};

const displayNoResultsInConfirmationPage = () => {
      addAndRemoveClasses([classReferences.conf_results_container], [classReferences.no_results_for_refine, classReferences.no_results]);
      updateNoResultLanguage($(".no-type-result"), $(".no-term-result"));
};

const displayInfoCode = data => {
    const { wUrl, wTeaser, Name, Type } = data.Similar.Info[0]
    $(".wiki-link").attr("href", wUrl);

    if (state.confirmationpage_wiki_info.hasOwnProperty("thumbnail")) {
        $(".info-image").attr("src", `${state.confirmationpage_wiki_info.thumbnail.source}`)
    }
    else {
      $(".info-image").attr("src", "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRtehRUbA2IoixzvtZaGM2ZWLZbNHYaFjH77t_1aS3cleGTQxEwM-ZmiA")
  }

  $(".info-summary").prepend(`${wTeaser} `);
  $(".name-of-interest").text(Name.toUpperCase());
  $(".type-of-interest").text(Type.toUpperCase());

};

const displayInfoInConfirmationPage = data => {
    displayInfoCode(data);

    addAndRemoveClasses([classReferences.search_page, classReferences.no_results_for_refine], [classReferences.result_confirmation_page, classReferences.conf_results_container])
};

const displayTasteDiveData = data => {
    if (!data.Similar.Results.length) {
        displayNoResultsInConfirmationPage();
        return;
    }
    state.result = data.Similar.Results;
    displayInfoInConfirmationPage(data);
};


const storeWikiPicsForResults = args => {
    let newArgs = args.filter(ele => ele[0].query);

    state.wikiPicsForResults = newArgs.map(ele => {
        return ele[0].query.pages.find(ele2 => {
            return ele2.index === 1
        })
    })
    renderResultsToResultsPage();
}

const makeASecondCallToWiki = () => {
    let arrayOfSearchTerms = state.result.map(ele => ele.Name);

    const arrayOfPromises = arrayOfSearchTerms.map(ele => getDataFromWikipediaApi(ele));
    $.when.apply($, arrayOfPromises).then((...args) => {
      storeWikiPicsForResults(args);
    });
};

const updateResults = (ele, index, sliceIndex) => {
    if(!ele.thumbnail) {
        return (
                `<img class="result-thumbs" src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTs-hzO2hxD25PjrZLH_5zFbZ8qIkTUIOvW4pC21_0BLFLeUnXs5G2LLQ" data-index="${(sliceIndex * 5) + index}">
                <p class="results">${ele.title.toUpperCase()}</p>`
               );
    }
    else {
        return (
                `<img class="result-thumbs" src="${ele.thumbnail.source}" data-index="${(sliceIndex * 5) + index}">
                <p class="results">${ele.title.toUpperCase()}</p>`
               );
    }
};

const renderResults = listOfResultsElement => {
    $(".result-list").html(listOfResultsElement);
    $(".page-number").text(`Page: ${sliceIndex + 1}`);

    $("result-list").scrollTop(0)
}

const renderResultsToResultsPage = () => {
    let resultArray = state.wikiPicsForResults.slice(sliceIndex * 5, (sliceIndex * 5) + 5);

    if (resultArray.length < 0) {
        $(".result-list").append("<h3>Sorry, no additional results</h3>");
        addAndRemoveClasses([classReferences.more_results], [""]);
        return;
    }
    const listOfResultsElement = resultArray.map((ele, index) => updateResults(ele, index, sliceIndex));

    addAndRemoveClasses([classReferences.no_refined_results], [classReferences.results_container]);
    renderResults(listOfResultsElement);

};

const renderPriorPageOfResults = () => {
    sliceIndex = sliceIndex - 1;

    let resultArray = state.wikiPicsForResults.slice((sliceIndex * 5), (sliceIndex * 5) + 5);
    const listOfResultsElement = resultArray.map((ele, index) => updateResults(ele, index, sliceIndex));
    renderResults(listOfResultsElement);
};

const getInfoForRefinedSearch = (data) => {
    if (!data.Similar.Results.length) {
        addAndRemoveClasses([classReferences.results_container, classReferences.result_buttons], [classReferences.no_refined_results]);
        updateNoResultLanguage($(".no-type-result"), $(".no-term-result"))
        return
    }
    state.result = data.Similar.Results;
    displayInfoCode(data);
    makeASecondCallToWiki();

};

const formatedResultInfoHtml = (infoObj) => {
    return (
            `<div class ="index-p result-info-heading" data-indexnum="${state.indexNum}">More Info About ${infoObj.Name}</div>
             <div class="info-paragraph">${infoObj.wTeaser}
                <a class="info-link" href="${infoObj.wUrl}">Read More</a>
            </div>
            <div class="iFrame">
                <iframe class="iFrame-box" width="300" height="250" src="http://www.youtube.com/embed/${infoObj.yID}"  frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="info-buttons-container">
                <button type="button" class="back-to-result-list info-buttons">Go back to more like ${state.searchQuery}!</button>
                <button type="button" class="find-more-like-new-topic info-buttons">Find MORE like ${infoObj.Name}!</button>
            </div>`
          )
};

const displayFormattedNoAdditionalInfoHtml = () => {
    return (
            `<h1 class="no-info">Sorry, no additional info available!</h1><div class="info-buttons-container">
            <button type="button" class="back-to-result-list info-buttons">Go back to more like ${state.searchQuery}!</button>
            </div>`
          )
}

const storeNewInfoObj = data => {
  let newInfoObj = data.similar;

  let infoHtml = !newInfoObj ? displayFormattedNoAdditionalInfoHtml() : formatedResultInfoHtml(newInfoObj)

  $(".info-container").html(infoHtml);
};

const renderInfoToInfoPage = () => {
    state.title = state.wikiPicsForResults[state.indexNum].title;
    let infoObj = state.result.find(ele => ele.Name.toLowerCase().trim() === state.title.toLowerCase().trim());

    if (!infoObj) {
      getDataFromTasteDiveApi(URL.TASTEDIVE, state.title, storeNewInfoObj)
      return
    }
    const infoHtml = formatedResultInfoHtml(infoObj);

    $(".info-container").html(infoHtml);
};

const watchForSearchClick = () => {
    $('.js-search-form').on("click", ".search-button", event => {
        event.preventDefault();

        let typeOfInterest = $(event.target).val();

        resetState(typeOfInterest)
        resetConfirmationPageResults()

        state.searchQuery = $(".search-field").val();

        getDataFromTasteDiveApi(state.searchQuery, state.type, displayTasteDiveData);
        getDataFromYoutubeApi(state.searchQuery, displayYouTubeData)
        getDataFromWikipediaApi(state.searchQuery, storeWikiThumbnails)
      });
};


const watchForRefinedSearchClick = () => {
    $('.js-new-search-form').on("click", ".search-button-smaller", event => {
        event.preventDefault();

        addAndRemoveClasses([classReferences.info_container], [classReferences.more_results, classReferences.result_button, classReferences.page_number, classReferences.prev_button])
        $(".go-back-to-prior-page-of-results").attr("disabled", "disabled");

        let typeOfInterest= $(event.target).val();

        resetState(typeOfInterest);
        resetConfirmationPageResults();

        getDataFromYoutubeApi(state.searchQuery, displayYouTubeData)
        getDataFromWikipediaApi(state.searchQuery, storeWikiThumbnails)
        getDataFromTasteDiveApi(state.searchQuery, state.type, getInfoForRefinedSearch);
    });
};

const watchForANewSearchClick = ()=> {
    $(".info-container").on("click", ".find-more-like-new-topic", event => {
        addAndRemoveClasses([classReferences.info_container], [classReferences.more_results, classReferences.result_button, classReferences.page_number, classReferences.prev_button])
        $(".go-back-to-prior-page-of-results").attr("disabled", "disabled");
        $("body").scrollTop(0);


        state.searchQuery = state.wikiPicsForResults[state.indexNum].title;
        let index = $(event.target).closest(".info-container")
                                   .find(".index-p")
                                   .attr("data-indexnum")

        let typeOfInterest = state.result[index].Type;
        resetState(typeOfInterest);
        resetConfirmationPageResults()

        getDataFromYoutubeApi(state.searchQuery, displayYouTubeData)
        getDataFromWikipediaApi(state.searchQuery, storeWikiThumbnails)
        getDataFromTasteDiveApi(state.searchQuery, state.type, getInfoForRefinedSearch)
    });
};

const watchForGoToResultsPageClick = () => {
    $(".go-to-results-button").on("click", event => {
        addAndRemoveClasses([classReferences.search_container, classReferences.result_confirmation_page], [classReferences.results_page, classReferences.js_new_search_form, classReferences.results_container]);
        $(".go-back-to-prior-page-of-results").attr("disabled", "disabled");
        $("body").scrollTop(0)

        makeASecondCallToWiki()
    });
};

const watchForGoBackToResultsClick = () => {
    $(".info-container").on("click", ".back-to-result-list", event => {
        addAndRemoveClasses([classReferences.info_container], [classReferences.result_thumbs, classReferences.results, classReferences.result_button, classReferences.page_number, classReferences.prev_button])
        $(".info-container").html("");

        $(".result-list").scrollTop(0);
        $("body").scrolTop(0);
    });
};


const watchForGetMoreInfoClick = () => {
     $(".result-list").on("click", ".result-thumbs", event => {
          addAndRemoveClasses([classReferences.result_button, classReferences.result_thumbs, classReferences.results, classReferences.page_number, classReferences.prev_button], [classReferences.info_container, event.target])
          $(event.target).next(".results").removeClass("hide");

          state.indexNum = (parseInt($(event.target).attr("data-index")));
          renderInfoToInfoPage();
    });
};

const watchForPrevButtonClick = () => {
    $(".prev-button").on("click", event  => {
        if ($(classReferences.info_container).hasClass("hide")) {
            addAndRemoveClasses([classReferences.results_page], [classReferences.result_confirmation_page])
            sliceIndex = 0
            return
        }
        addAndRemoveClasses([classReferences.info_container], [classReferences.result_thumbs, classReferences.results, classReferences.result_buttons])
        $(".info-container").html("");
    });
};


const watchForReturnHomeClick = () => {
    $(".js-return-home-button").on("click", event => {
        addAndRemoveClasses([classReferences.results_page, classReferences.result_confirmation_page, classReferences.no_results, classReferences.info_container], [classReferences.search_page])
        $(".search-field").val("");
    });
};

const watchForEmbedClick = () => {
    $(".youtube-video-results").on("click", ".thumbs", event => {
        addAndRemoveClasses([classReferences.iFrame, classReferences.thumbs, classReferences.youtube_channel_links, classReferences.more], [""]);
        $(event.target).next(".iFrame").removeClass("hide");
    });
};

const watchForGoBackFromEmbedClick = () => {
    $(".youtube-video-results").on("click", ".back", event => {
        addAndRemoveClasses([classReferences.iFrame], [classReferences.thumbs, classReferences.youtube_channel_links, classReferences.more])
    });
};

const watchForMoreYoutubeVideosClick = () => {
    $("body").on("click", ".more", event => {
        getDataFromYoutubeApi(state.searchQuery, displayYouTubeData, state.nextPageToken);
    });
};

const watchForNextResultsClick = () => {
    $(".more-results").on("click", event => {
        sliceIndex++;
        renderResultsToResultsPage();

        $(".result-list").scrollTop(0);
        $(".go-back-to-prior-page-of-results").removeAttr("disabled")
    });
};

const watchForPriorResultsClick = () => {
    $(".go-back-to-prior-page-of-results").on("click", event => {
          renderPriorPageOfResults();

          $(".result-list").scrollTop(0);

          if (sliceIndex === 0) {
              $(".go-back-to-prior-page-of-results").attr("disabled", "disabled");
        }
    });
};


const init = () => {
    watchForSearchClick();
    watchForRefinedSearchClick();
    watchForANewSearchClick();

    watchForGoToResultsPageClick();
    watchForGoBackToResultsClick();
    watchForGetMoreInfoClick();

    watchForReturnHomeClick();
    watchForPrevButtonClick();

    watchForEmbedClick();
    watchForGoBackFromEmbedClick();
    watchForMoreYoutubeVideosClick();

    watchForNextResultsClick();
    watchForPriorResultsClick();

}

$(init);
