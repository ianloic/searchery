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
                           this.urlbar.getAttribute('autocompletesearch') +
                           ' as-amazon as-google as-opensearch');
}

window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
                        false);
