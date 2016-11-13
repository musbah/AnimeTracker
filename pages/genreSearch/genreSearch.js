WinJS.UI.Pages.define("pages/genreSearch/genreSearch.html",
{
    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    ready: function (element, options)
    {
        element.querySelector("#gridView").winControl.addEventListener("iteminvoked", Lists.itemOnListClicked, false);
        loadSearchPage(element, options.animeInFilter, options.animeList, options.defaultGenres);
        document.getElementById("noRandom").style.display = "none";
        Util.showBackButton();
    }
});

function loadSearchPage(element,animeInFilter,animeList,defaultGenres)
{

    document.getElementById("addAnime").style.display = "none";
    document.getElementById("editAnime").style.display = "none";

    if (animeList.length <= 0)
    {
        Util.outputError("Please wait, still updating.");
        element.querySelector("#resultNumber").style.display = "block";
        element.querySelector("#resultNumber").innerHTML = "Please wait still updating the local database. (it will be updated when the text on the upper right dissapears)";
    }
    else
    {
        if (animeInFilter === null || animeInFilter === undefined)
        {
            //remove erotica by default
            var exclude = [5];
            var include = [];
            var noErotica = [];

            for (let i = 0; i < animeList.length; i++)
            {
                if (Util.isInFilter(include, exclude, animeList[i].genres))
                {
                    noErotica.push(animeList[i]);
                }
            }

            animeInFilter = noErotica;
        }


        //The list of results found
        var list = [];

        for (let i = 0; i < animeInFilter.length; i++)
        {

            var object =
                {
                    id: animeInFilter[i].id,
                    title: animeInFilter[i].name
                };

            if (animeInFilter[i].images[0] !== null)
            {
                object.image = "url('" + "http://cdn.animenewsnetwork.com/thumbnails/" + animeInFilter[i].images[0] + "')";
            }

            if (animeInFilter[i].altTitles[0] !== null && animeInFilter[i].altTitles[0] !== undefined)
            {
                object.altTitle = animeInFilter[i].altTitles[0].title;
            }
            else
            {
                object.altTitle = "";
            }

            object.allGenres = "";

            if (animeInFilter[i].genres !== null)
            {
                for (var b = 0; b < animeInFilter[i].genres.length; b++)
                {
                    for (var j = 0; j < defaultGenres.length; j++)
                    {
                        if (animeInFilter[i].genres[b] == j)
                        {
                            object.allGenres += defaultGenres[j];

                            if (animeInFilter[i].genres.length - 1 != b)
                            {
                                object.allGenres += ",";
                            }
                            else
                            {
                                object.allGenres += "";
                            }
                        }
                    }
                }
            }

            list.push(object);
        }

        if (animeInFilter.length > 0)
        {
            document.getElementById("status").innerHTML = list.length + " results found!";

            var gridList = new WinJS.Binding.List(list);
            element.querySelector("#gridView").winControl.itemDataSource = gridList.dataSource;
            element.querySelector("#gridView").winControl.itemTemplate = element.querySelector(".smallGridSearchItem");
            element.querySelector("#resultNumber").style.display = "none";
        }
        else
        {
            element.querySelector("#resultNumber").style.display = "block";
            element.querySelector("#resultNumber").innerHTML = "No results found";
        }
    }

    Util.resizeFunction();
}
