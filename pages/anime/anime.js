"use strict";

WinJS.UI.Pages.define("pages/anime/anime.html",
{
    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    ready: function (element, options)
    {
        //Don't add anything else here, this reloads before unload
        loadAnimeInfoPage(element, options.anime, options.defaultGenres);
        document.getElementById("noRandom").style.display = "none";
        Util.showBackButton();
    }
});

function xmlToVar(xml, id)
{
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "text/xml");

    var infoElement = xmlDoc.getElementsByTagName("info");

    var plot;
    var duration;
    var episodes;
    var themes = [];
    var dates = [];
    var opening = [];
    var ending = [];

    for (var i = 0; i < infoElement.length; i++)
    {
        var type = infoElement[i].getAttribute("type");

        if (type == "Plot Summary")
        {
            plot = infoElement[i].childNodes[0].nodeValue;
        }
        else if (type == "Themes")
        {
            themes.push(infoElement[i].childNodes[0].nodeValue);
        }
        else if (type == "Running time")
        {
            duration = infoElement[i].childNodes[0].nodeValue;
        }
        else if (type == "Number of episodes")
        {
            episodes = infoElement[i].childNodes[0].nodeValue;
        }
        else if (type == "Vintage")
        {
            dates.push(infoElement[i].childNodes[0].nodeValue);
        }
        else if (type == "Opening Theme")
        {
            opening.push(infoElement[i].childNodes[0].nodeValue);
        }
        else if (type == "Ending Theme")
        {
            ending.push(infoElement[i].childNodes[0].nodeValue);
        }
    }

    var ratingElement = xmlDoc.getElementsByTagName("ratings");
    var numberOfVotes;
    var rating;
    if (ratingElement[0] != undefined)
    {
        numberOfVotes = ratingElement[0].getAttribute("nb_votes");
        rating = ratingElement[0].getAttribute("weighted_score");
    }

    var episodeList = [];
    var episodesElement = xmlDoc.getElementsByTagName("episode");
    var titleElement = xmlDoc.getElementsByTagName("title");

    for (var i = 0; i < episodesElement.length; i++)
    {
        var ep = { number: episodesElement[i].getAttribute("num"), title: titleElement[i].childNodes[0].nodeValue };
        episodeList.push(ep);
    }

    var staffList = [];
    var staffElement = xmlDoc.getElementsByTagName("staff");
    var taskElement = xmlDoc.getElementsByTagName("task");
    var personElement = xmlDoc.getElementsByTagName("person");

    for (var i = 0; i < staffElement.length; i++)
    {
        var staff = { task: taskElement[i].childNodes[0].nodeValue, name: personElement[i].childNodes[0].nodeValue };
        staffList.push(staff);
    }

    var castList = [];
    var castElement = xmlDoc.getElementsByTagName("cast");
    var roleElement = xmlDoc.getElementsByTagName("role");
    for (var i = 0; i < castElement.length; i++)
    {
        if (castElement[i].getAttribute("lang") == "JA")
        {
            castList.push(roleElement[i].childNodes[0].nodeValue);
        }
    }

    return {
        plot: plot, duration: duration, episodes: episodes, themes: themes, dates: dates, opening: opening, ending: ending, numberOfVotes: numberOfVotes,
        rating: rating, episodeList: episodeList, staffList: staffList, castList: castList
    };
}

function loadAnimeInfoPage(element, info , defaultGenres)
{

    var url = "http://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=" + info.id;
    var title = info.name;
    var images = info.images;
    var genres = info.genres;
    var altTitles = info.altTitles;

    document.getElementById("animeLoading").style.display = "block";
    document.getElementById("animeLoading").innerHTML = "Loading anime information...";
    WinJS.xhr(
    {
            url: url
    })
    .done(
        function completed(result)
        {
            if (result.status === 200)
            {
                var response = result.responseText;

                var currentAnimeId = info.id;

                //checks if anime is in the user's list and does the necessary updates
                User.isInList(currentAnimeId);

                AnimeXmlToOutput(response, title, images, genres, altTitles, element, currentAnimeId , defaultGenres);
            }
            else
            {
                Util.outputError("Can't connect to the ANN's server.");
            }
        },
        function error(err)
        {
            Util.outputError("Can't connect to the ANN's server.");
        }
    );
}

function AnimeXmlToOutput(xml, title, images, genres, altTitles, element, currentAnimeId , defaultGenres)
{
    //outside of this "sub" page
    document.getElementById("animeLoading").style.display = "none";
    document.getElementById("animeName").innerHTML = title;
    document.getElementById("animeEditName").innerHTML = title;

    try
    {
        var moreInfo = document.createElement("a");
        moreInfo.innerHTML = "More information at Anime News Network";
        moreInfo.href = "http://www.animenewsnetwork.com/encyclopedia/anime.php?id=" + currentAnimeId;
        moreInfo.target = "_blank";
        document.getElementById("moreInfo").appendChild(moreInfo);
    }
    catch(e)
	{
        console.log(e);
	}

    var animeInfo = element.querySelector("#animeInfo");
    var titleSpan = element.querySelector("#title");
    var epAcc = element.querySelector("#epAccuracy");

    if (animeInfo != null && titleSpan != null && epAcc != null)
    {
        animeInfo.style.display = "flex";
        titleSpan.innerHTML = title;
        epAcc.innerHTML = "";

        var variables = xmlToVar(xml, currentAnimeId);

        try
        {
            var titleElement = element.querySelector("#titles");
            for (var i = 0; i < altTitles.length; i++)
            {
                var span = document.createElement("span");
                span.appendChild(document.createTextNode(altTitles[i].title));

                titleElement.appendChild(span);
                titleElement.appendChild(document.createElement("br"));
            }

            titleElement.style.display = "block";
        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            if (variables.plot != undefined)
            {
                element.querySelector("#synopsis").style.display = "block";
                element.querySelector("#plot").innerHTML = variables.plot;
            }
            else
            {
                //element.querySelector("#synopsis").style.display = "none";
                element.querySelector("#synopsis").className += " not-available";
            }
        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            element.querySelector("#cover img").setAttribute("src", "");
            element.querySelector("#cover img").setAttribute("alt", "Loading image...");
            var imageUrl = "http://cdn.animenewsnetwork.com/thumbnails/" + images[0];
            WinJS.xhr({ url: imageUrl, responseType: "blob" })
                .done(
                function (request)
                {
                    var image = URL.createObjectURL(request.response);

                    //If person clicks too fast, it will be null if it's unloading at the same time
                    var cover = element.querySelector("#cover img");
                    if (cover != null)
                    {
                        cover.setAttribute("src", image);
                    }
                },
                function (error)
                {
                    if (element.querySelector("#cover img") != null)
                    {
                        element.querySelector("#cover img").setAttribute("src", "");
                        element.querySelector("#cover img ").setAttribute("alt", "");
                        element.querySelector("#cover").className += " not-available";
                    }
                });
        }
        catch (e)
        {
            if (element.querySelector("#cover img") != null)
            {
                element.querySelector("#cover img").setAttribute("src", "");
                element.querySelector("#cover img").setAttribute("alt", "");
                element.querySelector("#cover").className += " not-available";
            }
        }

        try
        {
            if (genres.length > 0)
            {
                element.querySelector("#genres").style.display = "block";
                for (var i = 0; i < genres.length; i++)
                {
                    for (var j = 0; j < defaultGenres.length; j++)
                    {
                        if (genres[i] == j)
                        {
                            var li = document.createElement("li");
                            li.appendChild(document.createTextNode(defaultGenres[j]));
                            element.querySelector("#genresList").appendChild(li);
                        }
                    }
                }
            }
            else
            {
                //element.querySelector("#genres").style.display = "none";
                element.querySelector("#genres").className += " not-available";
            }
        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            var episodes = variables.episodeList;
            element.querySelector("#episodes").style.display = "block";
            if (episodes.length > 0)
            {
                for (var i = 0; i < episodes.length; i++)
                {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(episodes[i].number + ". " + episodes[i].title));
                    element.querySelector("#episodesList").appendChild(li);
                }
            }

            if (variables.episodes != undefined)
            {
                element.querySelector("#totalEpisodes").innerHTML = "Total Episodes: " + variables.episodes;
                document.getElementsByClassName("maxEpNum")[0].innerHTML = variables.episodes;
                document.getElementsByClassName("maxEpNum")[1].innerHTML = variables.episodes;
            }
            else
            {
                if (episodes.length > 0)
                {
                    element.querySelector("#totalEpisodes").innerHTML = "Total Episodes: " + episodes.length;
                    epAcc.innerHTML = "(May not be accurate)";
                    document.getElementsByClassName("maxEpNum")[0].innerHTML = episodes.length;
                    document.getElementsByClassName("maxEpNum")[1].innerHTML = episodes.length;
                }
                else
                {
                    //element.querySelector("#episodes").style.display = "none";
                    element.querySelector("#episodes").className += " not-available";
                }
            }
        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            var date = variables.dates;
            if (date.length > 0)
            {
                element.querySelector("#dates").style.display = "block";
                for (var i = 0; i < date.length; i++)
                {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(date[i]));
                    element.querySelector("#datesList").appendChild(li);
                }
            }
            else
            {
                //element.querySelector("#dates").style.display = "none";
                element.querySelector("#dates").className += " not-available";
            }

        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            if (variables.rating != undefined)
            {
                element.querySelector("#ratings").style.display = "block";

                //rounds the rating before outputting it
                element.querySelector("#ratingItem").innerHTML = "" + Math.round(variables.rating * 100) / 100 + "/10";
                element.querySelector("#userVotes").innerHTML = "(" + variables.numberOfVotes + " votes" + ") (ANN)";
            }
            else
            {
                //element.querySelector("#ratings").style.display = "none";
                element.querySelector("#ratings").className += " not-available";
            }

        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            var opening = variables.opening;
            if (opening.length > 0)
            {
                element.querySelector("#ops").style.display = "block";
                for (var i = 0; i < opening.length; i++)
                {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(opening[i]));
                    element.querySelector("#opList").appendChild(li);
                }
            }
            else
            {
                //element.querySelector("#ops").style.display = "none";
                element.querySelector("#ops").className += " not-available";
            }

        }
        catch (e)
        {
            console.log(e);
        }

        try
        {
            var ending = variables.ending;
            if (ending.length > 0)
            {
                for (var i = 0; i < ending.length; i++)
                {
                    element.querySelector("#eds").style.display = "block";
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(ending[i]));
                    element.querySelector("#edList").appendChild(li);
                }
            }
            else
            {
                //element.querySelector("#eds").style.display = "none";
                element.querySelector("#eds").className += " not-available";
            }

        }
        catch (e)
        {
            console.log(e);
        }

        //TODO add the code for each
        //var themes = variables.themes;

        try
        {
            var staff = variables.staffList;
            if (staff.length > 0)
            {
                element.querySelector("#staff").style.display = "block";
                for (var i = 0; i < staff.length; i++)
                {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(staff[i].task + ": " + staff[i].name));
                    element.querySelector("#staffList").appendChild(li);
                }
            }
            else
            {
                //element.querySelector("#staff").style.display = "none";
                element.querySelector("#staff").className += " not-available";
            }

        }
        catch (e)
        {

        }

        try
        {
            var characters = variables.castList;
            if (characters.length > 0)
            {
                element.querySelector("#characters").style.display = "block";
                for (var i = 0; i < characters.length; i++)
                {
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(characters[i]));
                    element.querySelector("#characterList").appendChild(li);
                }
            }
            else
            {
                //element.querySelector("#characters").style.display = "none";
                element.querySelector("#characters").className += " not-available";
            }

        }
        catch (e)
        {
            console.log(e);
        }
    }

    try
    {
        element.querySelector("#titles").onclick = function (e)
        {
            const {clipboard} = require('electron');
            clipboard.writeText(titleSpan.innerHTML);

            element.querySelector("#clipboard").winControl.show(e.target);

            setTimeout(function ()
            {
                if (element.querySelector("#clipboard") != undefined)
                    element.querySelector("#clipboard").winControl.hide();
            }, 2500);
        }
    }
    catch (e)
    {
        console.log(e);
    }

    Util.resizeFunction();

}
