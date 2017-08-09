const WinJS = require('winjs');
const Util = require('../../js/utilities.js');
const User = require('../../js/user.js');
const Settings = require('../../js/settings.js');
const Default = require('../../js/default.js');

const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");

var path;
var cacheEnabled;

var annUrlToUse = Default.annUrlToUse();

WinJS.UI.Pages.define("pages/anime/anime.html",
{
    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    ready: function (element, options)
    {
        cacheEnabled = Settings.isCacheEnabled;
        path = folder +"/cachedAnime/"+ options.anime.id + ".json";

        //check if a cache exists
        if(cacheEnabled && fs.existsSync(path))
        {
            readCache(element,options,true);
        }
        else
        {
            loadAnimeInfoPage(element, options.anime, options.defaultGenres);
        }

        document.getElementById("noRandom").style.display = "none";
        document.getElementById("status").innerText = "";
        Util.showBackButton();
    }
});

function readCache(element,options,checkDate)
{
    fs.readFile(path, function (err, data)
    {
        if (err)
        {
            console.log(err);
        }
        else
        {
            var animeCache = JSON.parse(data);

            if(checkDate)
            {
                var unixTimeNow = Math.round(new Date().getTime() / 1000);

                //check if the cache duration set by user expired
                //24*60*60 (1 day) = 86400
                if(animeCache.date + (Settings.days*86400) > unixTimeNow)
                {
                    document.getElementById("status").innerText = "Cached Version";
                    infoToOutput(animeCache.title, animeCache.images, animeCache.genres, animeCache.altTitles, element, options.anime.id, animeCache.defaultGenres, animeCache.extraInfo, true);
                }
                else
                {
                    loadAnimeInfoPage(element, options.anime, options.defaultGenres);    
                }
            }
            else
            {
                document.getElementById("status").innerText = "Cached Version";
                infoToOutput(animeCache.title, animeCache.images, animeCache.genres, animeCache.altTitles, element, options.anime.id, animeCache.defaultGenres, animeCache.extraInfo, true);
            }
        }
    });
}

function loadAnimeInfoPage(element, info , defaultGenres)
{

    var url = "http://cdn."+annUrlToUse+"/encyclopedia/api.xml?anime=" + info.id;
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

                infoToOutput(title, images, genres, altTitles, element, currentAnimeId , defaultGenres , xmlToVar(response), false);
            }
            else
            {
                Util.outputError("Can't connect to the ANN's server.");
                readCache(element,{anime:info,defaultGenres:defaultGenres},false);
            }
        },
        function error(err)
        {
            Util.outputError("Can't connect to the ANN's server.");
            readCache(element,{anime:info,defaultGenres:defaultGenres},false);
            console.log(err)
        }
    );
}

function xmlToVar(xml)
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

    for (let i = 0; i < infoElement.length; i++)
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
    if (ratingElement[0] !== undefined)
    {
        numberOfVotes = ratingElement[0].getAttribute("nb_votes");
        rating = ratingElement[0].getAttribute("weighted_score");
    }

    var episodeList = [];
    var episodesElement = xmlDoc.getElementsByTagName("episode");
    var titleElement = xmlDoc.getElementsByTagName("title");

    for (let i = 0; i < episodesElement.length; i++)
    {
        var ep = { number: episodesElement[i].getAttribute("num"), title: titleElement[i].childNodes[0].nodeValue };
        episodeList.push(ep);
    }

    var staffList = [];
    var staffElement = xmlDoc.getElementsByTagName("staff");
    var taskElement = xmlDoc.getElementsByTagName("task");
    var personElement = xmlDoc.getElementsByTagName("person");

    for (let i = 0; i < staffElement.length; i++)
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

function infoToOutput(title, images, genres, altTitles, element, currentAnimeId , defaultGenres , extraInfo , isUsingCache)
{
    if(cacheEnabled && !isUsingCache)
    {
        //unix time in seconds
        var unixTime = Math.round(new Date().getTime() / 1000);

        var animeDetails = {title:title,images:images,genres:genres,altTitles:altTitles,defaultGenres:defaultGenres,extraInfo:extraInfo,date:unixTime};
        fs.writeFile(path, JSON.stringify(animeDetails), function (err)
        {
            if (err)
                console.log(err);
        });
    }

    //outside of this "sub" page
    document.getElementById("animeLoading").style.display = "none";
    document.getElementById("animeName").innerHTML = title;
    document.getElementById("animeEditName").innerHTML = title;

    try
    {
        var moreInfo = document.createElement("a");
        moreInfo.innerHTML = "More information at Anime News Network";
        moreInfo.href = "http://www."+annUrlToUse+"/encyclopedia/anime.php?id=" + currentAnimeId;
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

    if (animeInfo !== null && titleSpan !== null && epAcc !== null)
    {
        animeInfo.style.display = "flex";
        titleSpan.innerHTML = title;
        epAcc.innerHTML = "";

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
            if (extraInfo.plot !== undefined)
            {
                element.querySelector("#synopsis").style.display = "block";
                element.querySelector("#plot").innerHTML = extraInfo.plot;
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

            if (images[0] !== undefined)
            {
                var imageUrl = "http://cdn."+annUrlToUse+"/thumbnails/" + images[0];
                WinJS.xhr({ url: imageUrl, responseType: "blob" })
                .done(
                function (result)
                {
                    if (result.status === 200)
                    {
                        var image = URL.createObjectURL(result.response);

                        //If person clicks too fast, it will be null if it's unloading at the same time
                        var cover = element.querySelector("#cover img");
                        if (cover !== null)
                        {
                            cover.setAttribute("src", image);
                        }
                    }
                    else
                    {
                        console.log(result.status);
                    }
                },
                function (err)
                {
                    if (element.querySelector("#cover img") !== null)
                    {
                        element.querySelector("#cover img").setAttribute("src", "");
                        element.querySelector("#cover img ").setAttribute("alt", "");
                        element.querySelector("#cover").className += " not-available";
                    }
                    console.log(err);
                });
            }
            else
            {
                if (element.querySelector("#cover img") !== null)
                {
                    element.querySelector("#cover img").setAttribute("src", "");
                    element.querySelector("#cover img ").setAttribute("alt", "");
                    element.querySelector("#cover").className += " not-available";
                }    
            }
        }
        catch (e)
        {
            if (element.querySelector("#cover img") !== null)
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
                for (let i = 0; i < genres.length; i++)
                {
                    for (let j = 0; j < defaultGenres.length; j++)
                    {
                        if (genres[i] == j)
                        {
                            let li = document.createElement("li");
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
            var episodes = extraInfo.episodeList;
            element.querySelector("#episodes").style.display = "block";
            if (episodes.length > 0)
            {
                for (let i = 0; i < episodes.length; i++)
                {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(episodes[i].number + ". " + episodes[i].title));
                    element.querySelector("#episodesList").appendChild(li);
                }
            }

            if (extraInfo.episodes !== undefined)
            {
                element.querySelector("#totalEpisodes").innerHTML = "Total Episodes: " + extraInfo.episodes;
                document.getElementsByClassName("maxEpNum")[0].innerHTML = extraInfo.episodes;
                document.getElementsByClassName("maxEpNum")[1].innerHTML = extraInfo.episodes;
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
            var date = extraInfo.dates;
            if (date.length > 0)
            {
                element.querySelector("#dates").style.display = "block";
                for (let i = 0; i < date.length; i++)
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
            if (extraInfo.rating !== undefined)
            {
                element.querySelector("#ratings").style.display = "block";

                //rounds the rating before outputting it
                element.querySelector("#ratingItem").innerHTML = "" + Math.round(extraInfo.rating * 100) / 100 + "/10";
                element.querySelector("#userVotes").innerHTML = "(" + extraInfo.numberOfVotes + " votes" + ") (ANN)";
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
            var opening = extraInfo.opening;
            if (opening.length > 0)
            {
                element.querySelector("#ops").style.display = "block";
                for (let i = 0; i < opening.length; i++)
                {
                    let li = document.createElement("li");
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
            var ending = extraInfo.ending;
            if (ending.length > 0)
            {
                for (let i = 0; i < ending.length; i++)
                {
                    element.querySelector("#eds").style.display = "block";
                    let li = document.createElement("li");
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
        //var themes = extraInfo.themes;

        try
        {
            var staff = extraInfo.staffList;
            if (staff.length > 0)
            {
                element.querySelector("#staff").style.display = "block";
                for (let i = 0; i < staff.length; i++)
                {
                    let li = document.createElement("li");
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
            var characters = extraInfo.castList;
            if (characters.length > 0)
            {
                element.querySelector("#characters").style.display = "block";
                for (let i = 0; i < characters.length; i++)
                {
                    let li = document.createElement("li");
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
                if (element.querySelector("#clipboard") !== undefined && element.querySelector("#clipboard") !== null)
                    element.querySelector("#clipboard").winControl.hide();
            }, 2500);
        };
    }
    catch (e)
    {
        console.log(e);
    }

    Util.resizeFunction();

}
