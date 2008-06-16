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
  if (Application.prefs.get("searchery.firstrun").value) {
    Application.prefs.setValue("searchery.firstrun", false);
    // show the welcome page in a tab
    gBrowser.selectedTab = 
      gBrowser.addTab("http://searchery.ianloic.com/welcome.html");
  }

  // add ourselves to the urlbar autocomplete list
  this.urlbar = document.getElementById('urlbar');
  this.urlbar.setAttribute('autocompletesearch', 
      'history srch-amazon srch-google srch-searchengines');

  var hide_searchbox_pref = 
    Application.prefs.get('searchery.hide-searchbox');

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
  this.menu = document.getElementById('searchery-menu');

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
  var manage_item = document.getElementById('srch-manage-search-engines');
  manage_item.addEventListener('command', Searchery.openManager, false);

  // trick the Firefox browser search functionality into using the urlbar
  // when we've hidden the search bar
  BrowserSearch.__defineGetter__('searchBar', function() {
      return hide_searchbox_pref.value ? 
        Searchery.urlbar : document.getElementById('searchbar') 
        })

  // wire up the 'searchButton' property to our ui
  this.urlbar.searchButton = document.getElementById('searchery-icon');

  // onpopupshowing event for the menu
  this.menu.addEventListener('popupshowing', function(event) {
      // clear out old 'add engine' menuitems
      var item = Searchery.menu.firstChild;
      while (item) {
        if (item.hasAttribute('addengine')) {
          var next = item.nextSibling;
          Searchery.menu.removeChild(item);
          item = next;
        } else {
          item = item.nextSibling;
        }
      }

      // add them if we need to

      var engines = getBrowser().mCurrentBrowser.engines;
      if (engines && engines.length > 0) {
        var separator = document.createElement('menuseparator');
        separator.setAttribute('addengine', 'true');
        Searchery.menu.appendChild(separator);
        for (var i=0; i<engines.length; i++) {
          var menuitem = document.createElement('menuitem');
          menuitem.setAttribute('addengine', 'true');
          menuitem.setAttribute('label', 'Add "'+engines[i].title+'"...');
          Searchery.menu.appendChild(menuitem);
        }
      }
      }, false);

  // we're putting more in the autocomplete - double its size
  this.urlbar.maxRows *= 2;
}

Searchery.openManager = function(event) {
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

window.addEventListener('load', function() { Searchery.windowOnLoad() }, 
    false);
