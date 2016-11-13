const fs = require('fs');
const remote = require('electron').remote;
const electronApp = remote.app;
const folder = electronApp.getPath("userData");
const fileName = "userList.json";


WinJS.Namespace.define("User",
    {
        initializeUserList: function ()
        {
            var userList = {};
            userList.list = [];

            fs.writeFile(folder + "/" + fileName, JSON.stringify(userList), { flag: 'wx' }, function (error)
            {
                if (error)
                    console.log(error);
            });
        },
        addToList: function (id, name, episode, comment, status)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);

                    var item = {id:id,name:name,episode:episode,comment:comment,status:status};

                    var length = userList.list.push(item);

                    fs.writeFile(folder + "/" + fileName, JSON.stringify(userList), function (error)
                    {
                        if (error)
                            console.log(error);
                    });

                    listLoad(userList.list);
                    getFromListAndLoad(userList.list[length - 1]);
                }
            });
        },
        editList: function (id, episode, comment, status)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);

                    for (var i = 0; i < userList.list.length; i++)
                    {
                        if (userList.list[i].id == id)
                        {
                            userList.list[i].episode = episode;
                            userList.list[i].comment = comment;
                            userList.list[i].status = status;

                            fs.writeFile(folder + "/" + fileName, JSON.stringify(userList), function (error)
                            {
                                if (error)
                                    console.log(error);
                            });

                            listLoad(userList.list);
                            getFromListAndLoad(userList.list[i]);
                            break;
                        }
                    }
                }
            });
        },
        isInList: function (id)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);
                    var exists = false;
                    for (var i = 0; i < userList.list.length; i++)
                    {
                        if (userList.list[i].id == id)
                        {
                            showHideAddEditButtons(userList.list[i], true);
                            exists = true;
                            break;
                        }
                    }

                    if (!exists)
                    {
                        showHideAddEditButtons(null, false);
                    }
                }
            });
        },
        removeSingleFromList: function (id)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);

                    for (var i = 0; i < userList.list.length; i++)
                    {
                        if (userList.list[i].id == id)
                        {
                            userList.list.splice(i, 1);
                            break;
                        }
                    }

                    fs.writeFile(folder + "/" + fileName, JSON.stringify(userList), function (error)
                    {
                        if (error)
                            console.log(error);
                    });

                    listLoad(userList.list);
                    showAddAnime();
                }
            });
        },
        removeManyFromList: function (itemIndices, currentAnimeId)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);
                    var newList = [];
                    var currentItemDeleted = false;

                    var j = 0;
                    for (var i = 0; i < userList.list.length; i++)
                    {
                        if (i != itemIndices[j])
                        {
                            newList.push(userList.list[i]);
                        }
                        else
                        {
                            if (currentAnimeId == userList.list[i].id)
                            {
                                currentItemDeleted = true;
                            }
                            j++;
                        }
                    }

                    userList.list = newList;

                    fs.writeFile(folder + "/" + fileName, JSON.stringify(userList), function (error)
                    {
                        if (error)
                            console.log(error);
                    });

                    listLoad(userList.list);
                    selectionListDelete(currentItemDeleted);
                }
            });
        },
        loadUserList: function ()
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var userList = JSON.parse(data);

                    listLoad(userList.list);
                }
            });
        },
        sortUserList: function (sort)
        {
            fs.readFile(folder + "/" + fileName, function (error, data)
            {
                if (error)
                {
                    console.log(error);
                }
                else
                {
                    var sortList = JSON.parse(data).list;

                    if (sort == "alpha")
                    {
                        sortList.sort(function (a, b)
                        {
                            var item1 = a.name.toUpperCase();
                            var item2 = b.name.toUpperCase();
                            return (item1 < item2) ? -1 : (item1 > item2) ? 1 : 0;
                        });
                    }
                    else if (sort == "watched")
                    {
                        sortList.sort(function (a, b)
                        {
                            var item1 = a.episode;
                            var item2 = b.episode;
                            return item1 - item2;
                        });
                    }
                    else
                    {
                        //for sort by "added items", no need to do anything because
                        //the json is already sorted by that order
                    }

                    listLoad(sortList);
                }
            });
        }
    });

function listLoad(list)
{
    var lettersList = new WinJS.Binding.List(list);
    var listViewControl = document.getElementById("listView").winControl;
    var header = document.getElementById("listHeader");

    listViewControl.itemDataSource = lettersList.dataSource;
    listViewControl.header = header;
    header.style.display = "block";
    listViewControl.itemTemplate = document.getElementById("smallListItem");
}


function getFromListAndLoad(item)
{
    document.getElementById("animeEditName").innerHTML = item.name;
    document.getElementById("epEditField").value = item.episode;
    document.getElementById("animeEditComment").value = item.comment;
    document.getElementById("animeEditStatus").value = item.status;
    showEditAnime();
}

function showHideAddEditButtons(item, isInList)
{
    if (isInList)
    {
        getFromListAndLoad(item);
    }
    else
    {
        showAddAnime();
    }

}

function showEditAnime()
{
    document.getElementById("editAnime").style.display = "block";
    document.getElementById("addAnime").style.display = "none";
}

function showAddAnime()
{
    document.getElementById("epField").value = "";
    document.getElementById("animeComment").value = "";
    document.getElementById("animeStatus").value = "Watching";
    document.getElementById("addAnime").style.display = "block";
    document.getElementById("editAnime").style.display = "none";
}

//if the anime you're at has been deleted from the list
function selectionListDelete(currentItemDeleted)
{
    if (currentItemDeleted)
    {
        document.getElementById("addAnime").style.display = "block";
        document.getElementById("editAnime").style.display = "none";
    }
}
