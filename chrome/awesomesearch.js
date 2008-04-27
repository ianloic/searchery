/* main JS file for AwesomeSearch */

var AwesomeSearch = {};

// initialization
AwesomeSearch.windowOnLoad = function() {
  // add ourselves to the urlbar autocomplete list
  this.urlbar = document.getElementById('urlbar');
  this.urlbar.setAttribute('autocompletesearch',
                           this.urlbar.getAttribute('autocompletesearch') +
                           ' as-google');
}

window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
                        false);
