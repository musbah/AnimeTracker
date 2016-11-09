
WinJS.Namespace.define("Util",
    {
        outputError: function (string)
        {
            document.getElementById("status").innerHTML = string;
            document.getElementById("animeLoading").innerHTML = string;
        },
        showBackButton: function ()
        {
            if (WinJS.Navigation.canGoBack)
            {
                document.getElementById("backButton").style.display = "block";
            }
            else
            {
                document.getElementById("backButton").style.display = "none";
            }
        },
        isEqualToAnime: function (anime, query)
        {
            //var queryLettersToChange = [
            //    [':', ''],
            //    ['☆★', ' ']
            //];

            //trying to optimize the way the search goes
            //var animeTitlesToChange = [
            //    ['ōö', 'o' , 'ou'],
            //    ['ū', 'u', 'uu'],
            //    ['éē', 'e'],
            //    ['ā', 'a'],
            //    ['ī', 'i'],
            //    ['-', ''],
            //    [' ', '', '☆', '★'],
            //    [':','']
            //];

            var query1 = query.replace(/[☆★♪]/g, " ");
            var regex = new RegExp(escapeRegex(query1), 'i');

            return searchInTitle(anime, regex);
        },
        isInFilter: function (include, exclude, genres)
        {
            for (var i = 0; i < exclude.length; i++)
            {
                if (isInArray(exclude[i], genres))
                {
                    return false;
                }
            }

            for (var i = 0; i < include.length; i++)
            {
                if (!isInArray(include[i], genres))
                {
                    return false;
                }
            }

            return true;
        },
        resizeFunction: function ()
        {
            //for small screens (phones mostly)
            if (window.outerWidth <= 708)
            {
                document.getElementById("leftContainer").style.width = "10%";
                document.getElementById("leftContainer").style.overflow = "hidden";
                document.getElementById("rightContainer").style.width = "90%";

                document.getElementById("backButton").winControl.label = "";
                document.getElementById("homeButton").winControl.label = "";
                document.getElementById("addAnime").winControl.label = "";
                document.getElementById("editAnime").winControl.label = "";
                document.getElementById("settingsButton").winControl.label = "";
                document.getElementById("showListInBar").winControl.label = "";
                document.getElementById("hideListInBar").winControl.label = "";

                document.getElementById("searchArea").style.height = "10%";
                document.getElementById("searchBoxId").style.height = "50%";
                document.getElementById("searchButton").style.height = "50%";

                document.getElementById("searchDropDown").style.top = "50%";

                document.getElementById("searchBoxId").style.borderBottom = "1px solid #C9C9C9";

                document.getElementById("randomAnime").style.top = "0px";
                document.getElementById("randomAnime").style.transform = "none";
                document.getElementById("randomAnime").style.position = "none";
                document.getElementById("randomAnime").style.marginTop = "5px";

                document.getElementById("randomAnime").style.clear = "left";

                document.getElementById("animeGenreSearch").style.top = "0px";
                document.getElementById("animeGenreSearch").style.transform = "none";
                document.getElementById("animeGenreSearch").style.position = "none";
                document.getElementById("animeGenreSearch").style.marginTop = "5px";

                document.getElementById("filter").style.top = "0px";
                document.getElementById("filter").style.transform = "none";
                document.getElementById("filter").style.position = "none";
                document.getElementById("filter").style.marginTop = "5px";

                document.getElementById("line-separatorId").style.height = "50%";
                document.getElementById("status").style.display = "none";

                //if on anime page
                if (WinJS.Navigation.location == "pages/anime/anime.html")
                {
                    document.getElementById("animeInfo").style.width = "90%";
                    document.getElementById("titles").style.width = "85%";

                    var elementsByClass = document.getElementsByClassName("block");
                    for (var i = 0; i < elementsByClass.length; i++)
                    {
                        elementsByClass[i].style.minWidth = "90%";
                    }
                    document.getElementById("titles").style.minWidth = "85%";
                }
                else if (WinJS.Navigation.location == "pages/genreSearch/genreSearch.html" || WinJS.Navigation.location == "pages/search/search.html")
                {
                    var elementsByClass = document.getElementsByClassName("smallGridItemInfo");
                    for (var i = 0; i < elementsByClass.length; i++)
                    {
                        elementsByClass[i].style.width = "200px";
                    }
                }
            }
            else
            {
                document.getElementById("leftContainer").style.width = "20%";
                document.getElementById("leftContainer").style.overflow = "none";
                document.getElementById("rightContainer").style.width = "80%";

                document.getElementById("backButton").winControl.label = "Back";
                document.getElementById("homeButton").winControl.label = "Home";
                document.getElementById("addAnime").winControl.label = "Add to list";
                document.getElementById("editAnime").winControl.label = "Edit list";
                document.getElementById("settingsButton").winControl.label = "Settings";
                document.getElementById("showListInBar").winControl.label = "Show List";
                document.getElementById("hideListInBar").winControl.label = "Hide List";

                document.getElementById("searchArea").style.height = "5%";
                document.getElementById("searchBoxId").style.height = "95%";
                document.getElementById("searchButton").style.height = "100%";

                document.getElementById("searchBoxId").style.borderBottom = "none";
                document.getElementById("searchDropDown").style.top = "100%";

                document.getElementById("randomAnime").style.top = "50%";
                document.getElementById("randomAnime").style.transform = "translateY(-50%)";
                document.getElementById("randomAnime").style.position = "relative";
                document.getElementById("randomAnime").style.marginTop = "0px";

                document.getElementById("animeGenreSearch").style.top = "50%";
                document.getElementById("animeGenreSearch").style.transform = "translateY(-50%)";
                document.getElementById("animeGenreSearch").style.position = "relative";
                document.getElementById("animeGenreSearch").style.marginTop = "0px";

                document.getElementById("randomAnime").style.clear = "none";

                document.getElementById("filter").style.top = "50%";
                document.getElementById("filter").style.transform = "translateY(-50%)";
                document.getElementById("filter").style.position = "relative";
                document.getElementById("filter").style.marginTop = "0px";

                document.getElementById("line-separatorId").style.height = "100%";
                document.getElementById("status").style.display = "block";

                //if on anime page
                if (WinJS.Navigation.location == "pages/anime/anime.html")
                {
                    document.getElementById("animeInfo").style.width = "80%";
                    document.getElementById("titles").style.width = "75%";

                    var elementsByClass = document.getElementsByClassName("block");
                    for (var i = 0; i < elementsByClass.length; i++)
                    {
                        elementsByClass[i].style.minWidth = "20%";
                    }

                    document.getElementById("titles").style.minWidth = "none";
                }

                /* if (WinJS.Navigation.location == "pages/genreSearch/genreSearch.html" || WinJS.Navigation.location == "pages/search/search.html")
                 {
                     var elementsByClass = document.getElementsByClassName("smallGridItemInfo");
                     for (var i = 0; i < elementsByClass.length; i++)
                     {
                         elementsByClass[i].style.width = "400px";
                     }
                 }*/
            }
        }
    });

function isInArray(value, array)
{
    for (var j = 0; j < array.length; j++)
    {
        if (array[j] == value)
        {
            return true;
        }
    }

    return false;
}

function searchInTitle(anime, regex)
{
    return anime.match(regex) || anime.replace(/[ōö]/g, "o").match(regex) || anime.replace(/[ō]/g, "ou").match(regex) || anime.replace(/ū/g, "u").match(regex) || anime.replace(/ū/g, "uu").match(regex)
        || anime.replace(/[éē]/g, "e").match(regex) || anime.replace(/ā/g, "a").match(regex) || anime.replace(/ī/g, "i").match(regex) || anime.replace(/-/g, " ").match(regex) || anime.replace(/-/g, "").match(regex)
        || anime.replace(/ /g, "").match(regex) || anime.replace(/:/g, "").match(regex) || anime.replace(/[☆★♪]/g, " ").match(regex)
}

function escapeRegex(s)
{
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}