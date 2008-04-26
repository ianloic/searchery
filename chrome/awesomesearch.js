/* main JS file for AwesomeSearch */

var AwesomeSearch = {};

// logging
AwesomeSearch.consoleService = 
  Components.classes["@mozilla.org/consoleservice;1"]
  .getService(Components.interfaces.nsIConsoleService);
AwesomeSearch.log = function(aMessage) {
  aMessage = 'AwesomeSearch: ' + aMessage;
  this.consoleService.logStringMessage(aMessage);
  dump(aMessage);
}

// initialization
AwesomeSearch.windowOnLoad = function() {
  this.log('windowOnLoad');
}



window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
    false);
