const fileName = "settings.json";

const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");

module.exports =
{
    loadSettings: function ()
    {
        createCacheAnimeFolder();
    },
    days:1,
    isCacheEnabled: true
};

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