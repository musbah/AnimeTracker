const WinJS = require('winjs');
const Util = require('../../js/utilities.js');

WinJS.UI.Pages.define("pages/home/home.html",
{
    ready: function (element, options)
    {
        document.getElementById("noRandom").style.display = "none";
        Util.showBackButton();

        document.getElementById("animeLoading").style.display = "block";
        document.getElementById("animeLoading").innerText = "Getting the latest news";
        WinJS.xhr(
        {
                url: "http://myanimetracker.com/downloads/news.html"
        })
        .done(complete,error);
    }
});

function complete(result)
{
    if (result.status === 200)
    {
        document.getElementById("animeLoading").style.display = "none";
        document.getElementById("newsContent").innerHTML = result.responseText;
    }
    else
    {
        document.getElementById("animeLoading").innerText = "Error getting the latest news";
        console.log(result.status);
    }
}

function error(err)
{
    document.getElementById("animeLoading").innerText = "Error getting the latest news";
    console.log(err);
}
