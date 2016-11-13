const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");
const fileName = "anime.json";

WinJS.Namespace.define("Import",
    {
        initializeAnimeFile: function (internet)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
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
                    MyApp.Functions.loadAnimeList(oldInfo);

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
    });

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
                    MyApp.Functions.loadAnimeList(json);
                    document.getElementById("status").innerHTML = "";
                    fs.writeFile(folder + "/" + fileName, output, function (error)
                    {
                        console.log(error);
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
                    MyApp.Functions.loadAnimeList(oldInfo);
                    document.getElementById("status").innerHTML = "";
                    fs.writeFile(folder + "/" + fileName, JSON.stringify(oldInfo), function (error)
                    {
                        console.log(error);
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
            console.log(e);
        }
    }
    else
    {
        Util.outputError("Can't update local database");
        console.log(e);
    }
}

function error(err)
{
    Util.outputError("Can't update local database");
    console.log(e);
}

function allCompleted(result)
{
    if (result.status === 200)
    {
        try
        {
            var output = result.responseText;
            MyApp.Functions.loadAnimeList(JSON.parse(output));
            document.getElementById("status").innerHTML = "";

            fs.writeFile(folder + "/" + fileName, output, { flag: 'wx' }, function (error)
            {
                console.log(error);
            });
        }
        catch (e)
        {
            Util.outputError("Can't update local database, server update might be in progress");
            console.log(e);
        }
    }
}