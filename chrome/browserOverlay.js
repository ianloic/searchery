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
  if (Application.prefs.get("extensions.searchery.firstrun").value) {
    Application.prefs.setValue("extensions.searchery.firstrun", false);
    // show the welcome page in a tab
    gBrowser.selectedTab =
      gBrowser.addTab("http://searchery.ianloic.com/welcome.html");
  }

  // add ourselves to the urlbar autocomplete list
  this.urlbar = document.getElementById('urlbar');

  var hide_searchbox_pref =
    Application.prefs.get('extensions.searchery.hide-searchbox');

  // hide the searchbar if appropriate
  function show_or_hide_searchbox() {
    var searchbox = document.getElementById('search-container');
    if (searchbox) {
      if (hide_searchbox_pref.value) {
        searchbox.setAttribute('style', 'display:none');
      } else {
        searchbox.removeAttribute('style');
      }
    }
  }
  show_or_hide_searchbox();

  // add an event listener for pref changes
  hide_searchbox_pref.events.addListener('change', function (event) {
      show_or_hide_searchbox();
      });

  // trick the Firefox browser search functionality into using the urlbar
  // when we've hidden the search bar
  BrowserSearch.__defineGetter__('searchBar', function() {
      return hide_searchbox_pref.value ?
        Searchery.urlbar : document.getElementById('searchbar')
        })
}

window.addEventListener('load', function() { Searchery.windowOnLoad() },
    false);
