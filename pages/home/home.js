var WinJS = require('winjs');
var Util = require('../../js/utilities.js');

WinJS.UI.Pages.define("pages/home/home.html",
{
    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    ready: function (element, options)
    {
        document.getElementById("noRandom").style.display = "none";
        Util.showBackButton();
    }
});
