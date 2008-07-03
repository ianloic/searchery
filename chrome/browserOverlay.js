/*
 *  Copyright © 2008 Ian McKellar <ian@mckellar.org>
 *
 *  This file is part of Searchery.
 *
 *  Searchery is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Searchery is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Searchery.  If not, see <http://www.gnu.org/licenses/>.
 */

var Searchery = {};

// initialization
Searchery.windowOnLoad = function() {
  if (Application.prefs.get("extensions.searchery.first-run").value) {
    Application.prefs.setValue("extensions.searchery.first-run", false);
    // show the welcome page in a tab
    gBrowser.selectedTab =
      gBrowser.addTab("http://searchery.ianloic.com/welcome.html");

    // remove search box
    var nav_bar = document.getElementById('nav-bar');
    if (nav_bar) {
      nav_bar.currentSet = nav_bar.currentSet.split(',').filter(
        function(i) { return i!= 'search-container'; }).join(',');
      nav_bar.setAttribute('currentset', nav_bar.currentSet);
      document.persist('nav-bar', 'currentset');
      try {
        BrowserToolbarCustomizeDone();
      } catch(e) { }
      // do a little fixup
      gURLBar = document.getElementById("urlbar");
    }
  }

  // trick the Firefox browser search functionality into using the urlbar
  // when the searchbar is hidden
  BrowserSearch.__defineGetter__('searchBar', function() {
    var searchbar = document.getElementById('searchbar');
    if (!searchbar) {
      searchbar = document.getElementById('urlbar');
    }
    return searchbar;
  });
}

window.addEventListener('load', function() { Searchery.windowOnLoad() },
    false);
