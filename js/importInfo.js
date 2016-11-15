const WinJS = require('winjs');
const Default = require('./default.js');
const Util = require('./utilities.js');

const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");
const fileName = "anime.json";

module.exports =
    {
        initializeAnimeFile: function (internet)
        {
            fs.readFile(folder + "/" + fileName, function (err, data)
            {
                if (err)
                {
                    //file does not exist
                    if (internet)
                    {
                        getInfo("all", null).done(allCompleted, error);
                    }
                    else
                    {
                        Util.outputError("No internet, can't download necessary data");
                    }
                }
                else
                {
                    var oldInfo = JSON.parse(data);

                    //Uses the old file's data before checking for updates (for the program to run smoothly)
                    Default.loadAnimeList(oldInfo);

                    if (internet)
                    {
                        getInfo("partial", oldInfo.lastIndex).done(function (result)
                        {
                            partialCompleted(result, oldInfo);
                        }, error);
                    }
                    else
                    {
                        Util.outputError("No internet, can't update the local database");
                    }
                }
            });
        }
    }

function getInfo(type, lastIndex)
{
    var url;

    if (type == "all")
    {
        url = "http://myanimetracker.com/getJson.php";
    }
    else
    {
        url = "http://myanimetracker.com/getJson.php?lastIndex=" + parseInt(lastIndex);
    }

    var promise = WinJS.xhr(
        {
            url: url
        });

    return promise;
}

function partialCompleted(result, oldInfo)
{
    if (result.status === 200)
    {
        try
        {
            var output = result.responseText;
            //if there was a change in the db, update
            if (output != "none")
            {
                var json = JSON.parse(output);

                //if it has property items, then something is wrong and so 
                //the output is the whole db.
                if (json.hasOwnProperty('items'))
                {
                    Default.loadAnimeList(json);
                    document.getElementById("status").innerHTML = "";
                    fs.writeFile(folder + "/" + fileName, output, function (err)
                    {
                        console.log(err);
                    });
                }
                else
                {
                    var i;
                    for (i = 0; i < json.newItems.length; i++)
                    {
                        oldInfo.items.push(json.newItems[i]);
                    }

                    oldInfo.lastIndex += i;
                    Default.loadAnimeList(oldInfo);
                    document.getElementById("status").innerHTML = "";
                    fs.writeFile(folder + "/" + fileName, JSON.stringify(oldInfo), function (err)
                    {
                        console.log(err);
                    });
                }
            }
            else
            {
                document.getElementById("status").innerHTML = "";
            }
        }
        catch (e)
        {
            Util.outputError("Can't update local database, server update might be in progress");
        }
    }
    else
    {
        Util.outputError("Can't update local database");
    }
}

function error(err)
{
    Util.outputError("Can't update local database");
    console.log(err);
}

function allCompleted(result)
{
    if (result.status === 200)
    {
        try
        {
            var output = result.responseText;
            Default.loadAnimeList(JSON.parse(output));
            document.getElementById("status").innerHTML = "";

            fs.writeFile(folder + "/" + fileName, output, { flag: 'wx' }, function (err)
            {
                console.log(err);
            });
        }
        catch (e)
        {
            Util.outputError("Can't update local database, server update might be in progress");
            console.log(e);
        }
    }
}