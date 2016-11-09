﻿
"use strict";

WinJS.UI.Pages.define("pages/search/search.html",
    {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options)
        {
            element.querySelector("#gridView").winControl.addEventListener("iteminvoked", Lists.itemOnListClicked, false);
            loadSearchPage(options.query, element, options.animeList, options.defaultGenres);
            document.getElementById("noRandom").style.display = "none";
            Util.showBackButton();
        },

        unload: function ()
        {
            // Respond to navigations away from this page.
        },

        updateLayout: function (element)
        {
            /// <param name="element" domElement="true" />

            // Respond to changes in layout.
        }
    });

function loadSearchPage(query, element , animeList , defaultGenres)
{
    document.getElementById("addAnime").style.display = "none";
    document.getElementById("editAnime").style.display = "none";

    //The list of results found
    var list = [];

    for (var i = 0; i < animeList.length; i++)
    {
        if (Util.isEqualToAnime(animeList[i].name, query))
        {
            var object =
                {
                    id: animeList[i].id,
                    title: animeList[i].name
                };

            if (animeList[i].images[0] != null)
            {
                object.image = "url('" + "http://cdn.animenewsnetwork.com/thumbnails/" + animeList[i].images[0] + "')";
            }

            if (animeList[i].altTitles[0] != null)
            {
                object.altTitle = animeList[i].altTitles[0].title;
            }
            else
            {
                object.altTitle = "";
            }

            object.allGenres = "";

            if (animeList[i].genres != null)
            {
                for (var b = 0; b < animeList[i].genres.length; b++)
                {
                    for (var j = 0; j < defaultGenres.length; j++)
                    {
                        if (animeList[i].genres[b] == j)
                        {
                            object.allGenres += defaultGenres[j];

                            if (animeList[i].genres.length - 1 != b)
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

            list.push(object)
        }
        else
        {
            for (var j = 0; j < animeList[i].altTitles.length; j++)
            {
                if (Util.isEqualToAnime(animeList[i].altTitles[j].title, query))
                {
                    var object =
                        {
                            id: animeList[i].id,
                            title: animeList[i].name,
                            altTitle: animeList[i].altTitles[j].title
                        };

                    if (animeList[i].images[0] != "undefined")
                    {
                        object.image = "url('" + "http://cdn.animenewsnetwork.com/thumbnails/" + animeList[i].images[0] + "')";
                    }

                    object.allGenres = "";

                    if (animeList[i].genres != null)
                    {
                        for (var b = 0; b < animeList[i].genres.length; b++)
                        {
                            for (var k = 0; k < defaultGenres.length; k++)
                            {
                                if (animeList[i].genres[b] == k)
                                {
                                    object.allGenres += defaultGenres[k];

                                    if (animeList[i].genres.length - 1 != b)
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
                    break;
                }
            }
        }
    }

    if (list.length > 0)
    {
        document.getElementById("status").innerHTML = list.length + " results found!";
        var gridList = new WinJS.Binding.List(list);
        element.querySelector("#gridView").winControl.itemDataSource = gridList.dataSource;
        element.querySelector("#gridView").winControl.itemTemplate = element.querySelector(".smallGridSearchItem");
        element.querySelector("#resultNumber").style.display = "none";


        //TODO
        //var fixWidth = element.querySelectorAll(".win-listview .win-horizontal .win-gridlayout .win-uniformgridlayout .win-itemsblock");
        //var newWidth = element.querySelector("#gridView").clientWidth / fixWidth.length;

        //for (var i = 0; i < fixWidth.length; i++)
        //{
        //    fixWidth[i].style.width = newWidth + "px";
        //}
    }
    else
    {
        element.querySelector("#resultNumber").style.display = "block";
        element.querySelector("#resultNumber").innerHTML = "No results found";
    }

    Util.resizeFunction();
}
