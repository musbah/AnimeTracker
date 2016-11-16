const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");
const fileName = "settings.json";

var settings =
{
    loadSettings: function ()
    {
        createCacheAnimeFolder();
        loadSettingsFromFile();
    },
    getCacheSettings : getCacheSettings,
    saveSettings : saveSettings,
    isCacheEnabled: true,
    days:1
};

module.exports = settings;

function createCacheAnimeFolder()
{
    //if the folder doesn't exist, create it
    if(!fs.existsSync(folder + "/cachedAnime"))
    {
        fs.mkdir(folder + "/cachedAnime", function(err)
        {
            if(err)
                console.log(err);
        })
    }
}

function getCacheSettings()
{
    if(document.getElementById("cacheChecked").checked)
    {
        settings.isCacheEnabled = true;
    }
    else
    {
        settings.isCacheEnabled = false;
    }

    if(document.getElementById("cacheDuration").value != "")
        settings.days = parseFloat(document.getElementById("cacheDuration").value);
}

function saveSettings()
{
    getCacheSettings();
    fs.writeFile(folder + "/" + fileName, JSON.stringify({isCacheEnabled:settings.isCacheEnabled,days:settings.days}), function (err)
    {
        if (err)
            console.log(err);
    });
}

function loadSettingsFromFile()
{
    fs.readFile(folder + "/" + fileName, function (err, data)
    {
        if(err)
        {
        }
        else
        {
            data = JSON.parse(data);
            settings.isCacheEnabled = data.isCacheEnabled;
            settings.days = data.days;   
        }

        document.getElementById("cacheChecked").checked = settings.isCacheEnabled;
        document.getElementById("cacheNotChecked").checked = !settings.isCacheEnabled;
        document.getElementById("cacheDuration").value = settings.days;

            //To disable cache duration textbox on initialization when in need.
        if(!settings.isCacheEnabled)
            document.getElementById("cacheDuration").disabled = true;

    });
}

function deleteUserList()
{

}

function exportUserList()
{

}

function orderListBy()
{

}

function sideListAlwayShow(boolean)
{

}

function saveFilter()
{

}