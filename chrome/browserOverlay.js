/*
 *  Copyright © 2008 Ian McKellar <ian@mckellar.org>
 *
 *  This file is part of AwesomeSearch.
 *
 *  AwesomeSearch is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  AwesomeSearch is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with AwesomeSearch.  If not, see <http://www.gnu.org/licenses/>.
 */

var AwesomeSearch = {};

// initialization
AwesomeSearch.windowOnLoad = function() {
  // add ourselves to the urlbar autocomplete list
  this.urlbar = document.getElementById('urlbar');
  this.urlbar.setAttribute('autocompletesearch', 
      'history as-amazon as-google as-opensearch');

  var hide_searchbox_pref = 
    Application.prefs.get('awesomesearch.hide-searchbox');

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

  // add handlers for the menu
  this.menu = document.getElementById('awesomesearch-menu');

  // automatically handle boolean prefs on checkbox menu items
  var item = this.menu.firstChild;
  while (item) {
    if (item.hasAttribute('boolpref')) {
      // set the checked state to the pref value
      if (Application.prefs.getValue(item.getAttribute('boolpref'), false)) {
        item.setAttribute('checked', true);
      }
      item.addEventListener('command', function(event) {
          var item = event.target;
          // set the prev value to the checked state
          Application.prefs.setValue(item.getAttribute('boolpref'),
            item.hasAttribute('checked'));
      }, false);
    }
    item = item.nextSibling;
  }

  // hook up the "manage" menu item
  var manage_item = document.getElementById('as-manage-search-engines');
  manage_item.addEventListener('command', AwesomeSearch.openManager, false);

  // trick the Firefox browser search functionality into using the urlbar
  // when we've hidden the search bar
  BrowserSearch.__defineGetter__('searchBar', function() {
      return hide_searchbox_pref.value ? 
        AwesomeSearch.urlbar : document.getElementById('searchbar') 
        })

  // wire up the 'searchButton' property to our ui
  this.urlbar.searchButton = document.getElementById('awesomesearch-icon');
}

AwesomeSearch.openManager = function(event) {
  var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
    .getService(Components.interfaces.nsIWindowMediator);

  var win = wm.getMostRecentWindow('Browser:SearchManager');
  if (win) {
    win.focus()
  } else {
    setTimeout(function () {
      openDialog('chrome://browser/content/search/engineManager.xul',
                 '_blank', 'chrome,dialog,modal,centerscreen');
    }, 0);
  }
}

window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() }, 
    false);
