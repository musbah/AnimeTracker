var currentAnimeId;
var animeList;
var trieAnimeTree;
var animeInFilter;
var listView;
var mouseOnDropDown = false;
var focusOnSearch = false;

var app = WinJS.Application;

//default genres to use everywhere
var defaultGenres = ["Action", "Adventure", "Comedy", "Drama", "Slice of life", "Erotica", "Fantasy", "Magic", "Supernatural",
    "Horror", "Mystery", "Psychological", "Romance", "Science fiction", "Thriller", "Tournament"];

// Initialize your application here.
window.onload = function ()
{
    document.getElementById("status").innerHTML = "Initializing User List...";
    User.initializeUserList();

    //checks if an internet connection is available
    if (navigator.onLine)
    {
        Import.initializeAnimeFile(true);
    }
    else
    {
        document.getElementById("status").innerHTML = "No internet connection";
        Import.initializeAnimeFile(false);
    }

    WinJS.UI.processAll();

    //Picking the default page
    WinJS.Navigation.navigate("pages/home/home.html");

    initializeEventListeners();
};

app.start();

function initializeEventListeners()
{
    window.addEventListener("resize", Util.resizeFunction);

    //doing it with css doesn't initialise the toolbar correctly
    document.getElementById("listHeader").style.display = "none";
    document.getElementById("backButton").style.display = "none";

    var searchBox = document.getElementById("searchBoxId");
    searchBox.addEventListener("input", searchInput);
    searchBox.addEventListener("focusout", searchFocusOut);
    searchBox.addEventListener("focusin", searchInput);

    var searchDropDown = document.getElementById("searchDropDown");
    searchDropDown.onmouseover = function ()
    {
        mouseOnDropDown = true;
    };

    searchDropDown.onmouseout = function ()
    {
        mouseOnDropDown = false;
    };


    var searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", searchSubmit, false);

    document.getElementById("addAnime").addEventListener("click", showAddAnimeFlyout, false);
    document.getElementById("editAnime").addEventListener("click", showEditAnimeFlyout, false);

    document.getElementById("addAnimeSubmit").addEventListener("click", addAnime, false);
    document.getElementById("editAnimeSubmit").addEventListener("click", editAnime, false);
    document.getElementById("removeAnimeSubmit").addEventListener("click", removeAnime, false);

    document.getElementById("animeStatus").addEventListener("change", statusChange, false);
    document.getElementById("animeEditStatus").addEventListener("change", editStatusChange, false);

    document.getElementById("showListInBar").addEventListener("click", showList, false);
    document.getElementById("hideListInBar").addEventListener("click", hideList, false);

    listView = document.getElementById("listView");
    listView.addEventListener("iteminvoked", Lists.itemOnListClicked, false);
    listView.addEventListener("selectionchanged", listViewSelection, false);

    document.getElementById("randomAnime").addEventListener("click", randomId, false);
    document.getElementById("animeGenreSearch").addEventListener("click", animeGenreSearch, false);
    document.getElementById("filter").addEventListener("click", filterFlyout, false);
    document.getElementById("FilterFlyout").addEventListener("beforehide", filterFlyoutHide, false);
    //Create filter checkboxes for random
    createFilterElementsRandom();

    document.getElementById("homeButton").addEventListener("click", showHomeContainer, false);
    document.getElementById("backButton").addEventListener("click", goToPreviousContainer, false);


    document.getElementById("cmdSelect").addEventListener("click", selectAll, false);
    document.getElementById("cmdClear").addEventListener("click", clearSelections, false);
    document.getElementById("cmdDelete").addEventListener("click", deleteSelections, false);
    document.getElementById("cmdEdit").addEventListener("click", editSelections, false);

    document.getElementById("settingsButton").addEventListener("click", showSettingsFlyout, false);

    document.getElementById("animeListSortDropDown").addEventListener("change", animeListSort, false);

    document.addEventListener('keydown', keyDown);

    Util.resizeFunction();
}

WinJS.Namespace.define("MyApp.Functions",
{
    loadAnimeList: function (info)
    {
        animeList = info.items;

        var trieAnimeList = [];
        //Making objects out of every alt title (to make trie easier)
        for (var i = 0, len = animeList.length; i < len; i++)
        {
            var anime = { id: i, name: animeList[i].name };
            trieAnimeList.push(anime);

            for (let j = 0; j < animeList[i].altTitles.length; j++)
            {
                var animeAlt = { id: i, name: animeList[i].altTitles[j].title };
                trieAnimeList.push(animeAlt);
            }
        }

        var createTrie = require('autosuggest-trie');
        trieAnimeTree = createTrie(trieAnimeList, 'name');
    }
});

function keyDown(event)
{
    //When focus is on searchbar (to move on drop down)
    if (focusOnSearch)
    {
        if (event.keyCode == 13)
        {
            //if you press enter
            searchSubmit();

        }
        else
        {
            var dropList = document.getElementById("dropList");
            if (dropList.innerHTML !== "")
            {
                var element = dropList.getElementsByClassName("selectedDrop");

                if (event.keyCode == 38)
                {
                    //up arrow
                    if (element[0] !== undefined)
                    {
                        if (element[0].previousSibling === null)
                        {
                            element[0].className = "";
                            dropList.lastElementChild.className = "selectedDrop";
                            document.getElementById("searchDropDown").scrollTop = document.getElementById("searchDropDown").scrollHeight;
                        }
                        else
                        {
                            element[0].previousSibling.className = "selectedDrop";
                            element[0].nextSibling.className = "";

                            let elementBounding = element[0].getBoundingClientRect();
                            let searchDropDownBounding = document.getElementById("searchDropDown").getBoundingClientRect();

                            if (elementBounding.top < searchDropDownBounding.top)
                            {
                                document.getElementById("searchDropDown").scrollTop -= searchDropDownBounding.top - elementBounding.top;
                            }
                        }
                        searchBox.value = element[0].innerHTML;
                    }
                }
                else if (event.keyCode == 40)
                {
                    //down arrow
                    if (element.length === 0)
                    {
                        dropList.firstElementChild.className = "selectedDrop";
                    }
                    else
                    {
                        if (element[0].nextSibling === null)
                        {
                            element[0].className = "";
                            dropList.firstElementChild.className = "selectedDrop";
                            document.getElementById("searchDropDown").scrollTop = 0;
                        }
                        else
                        {
                            element[0].nextSibling.className = "selectedDrop";
                            element[0].className = "";

                            let elementBounding = element[0].getBoundingClientRect();
                            let searchDropDownBounding = document.getElementById("searchDropDown").getBoundingClientRect();

                            if (elementBounding.bottom > searchDropDownBounding.bottom)
                            {
                                document.getElementById("searchDropDown").scrollTop += elementBounding.bottom - searchDropDownBounding.bottom;
                            }
                        }
                    }
                    searchBox.value = element[0].innerHTML;
                }
            }
        }
    }
}

function createToggle(parent, name)
{
    var div = document.createElement("div");

    var label1 = document.createElement("label");
    var label2 = document.createElement("label");
    var label3 = document.createElement("label");

    var input1 = document.createElement("input");
    var input2 = document.createElement("input");
    var input3 = document.createElement("input");

    input1.name = name;
    input2.name = name;
    input3.name = name;

    input1.type = "radio";
    input2.type = "radio";
    input3.type = "radio";

    input1.value = "include";
    input2.value = "any";
    input3.value = "exclude";

    label1.appendChild(document.createTextNode("include"));
    label2.appendChild(document.createTextNode("any"));
    label3.appendChild(document.createTextNode("exclude"));

    label1.appendChild(input1);
    label2.appendChild(input2);
    label3.appendChild(input3);

    //make sure toggle is not erotica (if it is have to show it off by default)
    if (name != "genreRadio5")
    {
        label2.className = "selected";
        input2.checked = true;
    }
    else
    {
        label3.className = "selected";
        input3.checked = true;
    }

    div.appendChild(label1);
    div.appendChild(label2);
    div.appendChild(label3);

    div.id = name;
    div.className = "toggle";

    var td = document.createElement("td");
    td.appendChild(div);
    parent.appendChild(td);
}

function toggle(element, name)
{
    var toggle = element.querySelectorAll('input[name="' + name + '"]');
    for (var i = 0; i < toggle.length; i++)
    {
        toggle[i].addEventListener("change", toggleChange, false);
    }
}

function toggleChange()
{
    var labels = document.querySelectorAll('#' + this.getAttribute("name") + ' label');
    for (var i = 0; i < labels.length; i++)
    {
        labels[i].className = "";
    }
    this.parentNode.className += " selected ";
}

function searchFocusOut(event)
{
    focusOnSearch = false;
    if (!mouseOnDropDown)
    {
        document.getElementById("searchDropDown").style.display = "none";
    }
}

function searchInput(eventObject)
{
    focusOnSearch = true;

    if (animeList !== null)
    {
        var searchDropDown = document.getElementById("searchDropDown");
        var dropList = document.getElementById("dropList");

        dropList.innerHTML = "";
        searchDropDown.style.display = "block";

        var queryText = eventObject.target.value;

        //matches raw input with anime names
        var matches = trieAnimeTree.getMatches(queryText, { limit: 20 });

        for (var i = 0; i < matches.length; i++)
        {
            var li = document.createElement("li");
            li.id = "auto" + matches[i].id;
            li.appendChild(document.createTextNode(matches[i].name));

            dropList.appendChild(li);

            li.onclick = function (e)
            {
                document.getElementById("searchBoxId").value = e.srcElement.innerText;
                searchSubmit();
            };
        }

        if (matches.length === 0)
            searchDropDown.style.display = "none";
    }
}

function searchSubmit()
{
    var text = document.getElementById("searchBoxId").value;
    document.getElementById("searchDropDown").style.display = "none";

    if (text.trim() !== "" && animeList !== null)
    {
        //limit is 20 just to make sure similar titles won't be confused
        var match = trieAnimeTree.getMatches(text, { limit: 20 });

        var predefined = false;
        for (let i = 0; i < match.length; i++)
        {
            if (match[i].name == text)
            {
                predefined = true;

                let options = {anime:animeList[match[i].id] , defaultGenres:defaultGenres};
                WinJS.Navigation.navigate("pages/anime/anime.html", options);
                currentAnimeId = animeList[match[i].id].id;
                break;
            }
        }

        if (!predefined)
        {
            let options = { query: text, animeList: animeList, defaultGenres: defaultGenres };
            WinJS.Navigation.navigate("pages/search/search.html", options);
        }
    }
}

function showAddAnimeFlyout()
{
    var addButton = document.getElementById("addAnime");
    document.getElementById("AddAnimeFlyout").winControl.show(addButton);
}

function showEditAnimeFlyout()
{
    var addButton = document.getElementById("editAnime");
    document.getElementById("EditAnimeFlyout").winControl.show(addButton);
}

function showSettingsFlyout()
{
    var addButton = document.getElementById("settingsButton");
    document.getElementById("SettingsFlyout").winControl.show(addButton);
}

function filterFlyout()
{
    var addButton = document.getElementById("filter");
    document.getElementById("FilterFlyout").winControl.show(addButton);
}

function filterFlyoutHide()
{
    var selected = document.querySelectorAll('#filterGenres input[type="radio"]:checked');
    if (selected.length > 0)
    {
        animeInFilter = [];
        var include = [];
        var exclude = [];

        for (let i = 0; i < selected.length; i++)
        {
            if (selected[i].value == "include")
            {
                include.push(selected[i].name.replace("genreRadio", ""));
            }
            else if (selected[i].value == "exclude")
            {
                exclude.push(selected[i].name.replace("genreRadio", ""));
            }
        }

        for (let i = 0; i < animeList.length; i++)
        {
            if (Util.isInFilter(include, exclude, animeList[i].genres))
            {
                animeInFilter.push(animeList[i]);
            }
        }
    }
    else
    {
        animeInFilter = null;
    }
}

function showList()
{
    User.loadUserList();
    listView.style.display = "block";
    document.getElementById("hideListInBar").style.display = "block";
    document.getElementById("showListInBar").style.display = "none";
}

function hideList()
{
    listView.winControl.itemDataSource = null;
    listView.style.display = "none";
    document.getElementById("hideListInBar").style.display = "none";
    document.getElementById("showListInBar").style.display = "block";
}

WinJS.Namespace.define("Lists", {
    itemOnListClicked: function (eventObject)
    {
        eventObject.detail.itemPromise.done(function (invokedItem)
        {
            for (var i = 0; i < animeList.length; i++)
            {
                if (animeList[i].id == invokedItem.data.id)
                {
                    document.getElementById("status").innerHTML = "";

                    var options = {anime:animeList[i] , defaultGenres:defaultGenres};
                    WinJS.Navigation.navigate("pages/anime/anime.html", options);
                    currentAnimeId = animeList[i].id;
                    break;
                }
            }
        });
    },
});

function randomId()
{
    //List hasn't loaded yet
    if (animeList.length <= 0)
    {
        Util.outputError("Please wait, still updating.");
    }
    else
    {
        var item;
        if (animeInFilter !== null && animeInFilter !== undefined)
        {
            if (animeInFilter.length > 0)
            {
                //pick random array item
                item = animeInFilter[Math.floor(Math.random() * animeInFilter.length)];

                let options = {anime:item , defaultGenres:defaultGenres};
                WinJS.Navigation.navigate("pages/anime/anime.html", options);
                currentAnimeId = item.id;
            }
            else
            {
                document.getElementById("noRandom").style.display = "block";
            }
        }
        else
        {
            //remove erotica by default
            var exclude = [5];
            var include = [];
            var noErotica = [];

            for (var i = 0; i < animeList.length; i++)
            {
                if (Util.isInFilter(include, exclude, animeList[i].genres))
                {
                    noErotica.push(animeList[i]);
                }
            }

            //pick random array item
            item = noErotica[Math.floor(Math.random() * noErotica.length)];

            let options = {anime:item , defaultGenres:defaultGenres};
            WinJS.Navigation.navigate("pages/anime/anime.html", options);
            currentAnimeId = item.id;
        }
    }
}

function animeGenreSearch()
{
    var options = { animeInFilter: animeInFilter, animeList: animeList, defaultGenres: defaultGenres };
    WinJS.Navigation.navigate("pages/genreSearch/genreSearch.html", options);
}

function showHomeContainer()
{
    WinJS.Navigation.navigate("pages/home/home.html");
    document.getElementById("addAnime").style.display = "none";
    document.getElementById("editAnime").style.display = "none";
    document.getElementById("status").innerHTML = "";
}


function goToPreviousContainer()
{
    var i = 1;

    //If you're on search or genreSearch page then go back normally(otherwise it will skip all genreSearch pages even with different content)
    if (WinJS.Navigation.location != "pages/search/search.html" && WinJS.Navigation.location != "pages/genreSearch/genreSearch.html")
    {
        //Ignore duplicates (or reloads) when navigating back
        var length = WinJS.Navigation.history.backStack.length;
        while (i < length)
        {
            if (WinJS.Navigation.history.backStack[length - i].state == WinJS.Navigation.state)
            {
                i++;
            }
            else
            {
                break;
            }
        }
    }

    WinJS.Navigation.back(i);
    document.getElementById("status").innerHTML = "";
}

function listViewSelection()
{
    var count = listView.winControl.selection.count();
    if(count <= 0)
    {
        listView.winControl.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
    }
}

function addAnime()
{
    User.addToList(currentAnimeId, document.getElementById("animeName").innerHTML, document.getElementById("epField").value,
        document.getElementById("animeComment").value, document.getElementById("animeStatus").value);
    document.getElementById("AddAnimeFlyout").winControl.hide();

    //change the sort value to "added" to show that it doesn't sort automatically when an anime is added
    document.getElementById("animeListSortDropDown").value = "added";

}

function editAnime()
{
    User.editList(currentAnimeId, document.getElementById("epEditField").value,
        document.getElementById("animeEditComment").value, document.getElementById("animeEditStatus").value);
    document.getElementById("EditAnimeFlyout").winControl.hide();
}

function removeAnime()
{
    User.removeSingleFromList(currentAnimeId);
    document.getElementById("EditAnimeFlyout").winControl.hide();
}

function statusChange()
{
    if (document.getElementById("animeStatus").value == "Completed")
    {
        var maxEp = document.getElementsByClassName("maxEpNum")[0].innerHTML;

        //Make sure it's a number
        if (!isNaN(parseFloat(maxEp)) && isFinite(maxEp))
        {
            document.getElementById("epField").value = maxEp;
        }
    }
}

function editStatusChange()
{
    if (document.getElementById("animeEditStatus").value == "Completed")
    {
        var maxEp = document.getElementsByClassName("maxEpNum")[0].innerHTML;

        //Make sure it's a number
        if (!isNaN(parseFloat(maxEp)) && isFinite(maxEp))
        {
            document.getElementById("epEditField").value = maxEp;
        }
    }
}

function editSelections()
{
    if (listView.winControl.tapBehavior == WinJS.UI.TapBehavior.toggleSelect)
    {
        listView.winControl.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
    }
    else
    {
        listView.winControl.tapBehavior = WinJS.UI.TapBehavior.toggleSelect;
    }
}

function selectAll()
{
    listView.winControl.tapBehavior = WinJS.UI.TapBehavior.toggleSelect;
    listView.winControl.selection.selectAll();
}

function clearSelections()
{
    listView.winControl.selection.clear();
    listView.winControl.tapBehavior = WinJS.UI.TapBehavior.invokeOnly;
}

function deleteSelections()
{
    User.removeManyFromList(listView.winControl.selection.getIndices(), currentAnimeId);
}

function createFilterElementsRandom()
{
    var table = document.createElement("table");
    for (var i = 0; i < defaultGenres.length; i++)
    {
        var text = document.createTextNode(defaultGenres[i]);
        var name = "genreRadio" + i;

        var tr = document.createElement("tr");
        var td = document.createElement("td");

        td.appendChild(text);
        tr.appendChild(td);
        createToggle(tr, name);

        table.appendChild(tr);
        toggle(tr, name);
    }
    document.getElementById("filterGenres").appendChild(table);
}

function animeListSort()
{
    User.sortUserList(document.getElementById("animeListSortDropDown").value);
}
