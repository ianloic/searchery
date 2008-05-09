/* main JS file for AwesomeSearch */

var AwesomeSearch = {};

// initialization
AwesomeSearch.windowOnLoad = function() {
  // add ourselves to the urlbar autocomplete list
  this.urlbar = document.getElementById('urlbar');
  this.urlbar.setAttribute('autocompletesearch',
                           this.urlbar.getAttribute('autocompletesearch') +
                           ' as-amazon as-google');

  Application.activeWindow.events.addListener("TabOpen", 
      function (event) { AwesomeSearch.onTabOpen(event); })


}
AwesomeSearch.onTabOpen = function(event) {
  alert("it opened: "+event.data);
}


window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
                        false);
