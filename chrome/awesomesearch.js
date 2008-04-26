/* main JS file for AwesomeSearch */

var AwesomeSearch = {};

// logging
AwesomeSearch.consoleService = 
  Components.classes["@mozilla.org/consoleservice;1"]
  .getService(Components.interfaces.nsIConsoleService);
AwesomeSearch.log = function(aMessage) {
  aMessage = 'AwesomeSearch: ' + aMessage;
  this.consoleService.logStringMessage(aMessage);
  dump(aMessage+'\n');
}

// initialization
AwesomeSearch.windowOnLoad = function() {
  this.log('windowOnLoad');

  // find all the page elements we care about
  this.iframe = document.getElementById('__AS_iframe');
  this.urlbar = document.getElementById('urlbar');
  this.popup = document.getElementById('PopupAutoCompleteRichResult');
  this.richlistbox = document.getAnonymousElementByAttribute(this.popup,
      'anonid', 'richlistbox');
}



window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
    false);
