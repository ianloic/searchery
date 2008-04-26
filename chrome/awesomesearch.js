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

  // add event handlers as required
  this.iframe.addEventListener('DOMContentLoaded', 
      function (event) { AwesomeSearch.iframeOnLoad(event); }, false);
  this.urlbar.addEventListener('keypress',
      function (event) { AwesomeSearch.urlbarOnKeyPress(event); }, false);
}

// search result richlistbox management
AwesomeSearch.addSearchResult = function(title, type, url, image, text) {
  var item = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "richlistitem");
  item.setAttribute("image", image);
  item.setAttribute("url", url);
  item.setAttribute("title", title);
  item.setAttribute("type", type);
  item.setAttribute("text", text);

  item.className = "autocomplete-richlistitem";
  this.richlistbox.appendChild(item);
}

AwesomeSearch.clearSearchResults = function () {
  while (this.richlistbox.firstChild) {
    this.richlistbox.removeChild(this.richlistbox.firstChild);
  }
}

// iframe load handler
AwesomeSearch.iframeOnLoad = function(event) {
  this.log('loaded...');
  this.log(event.target.location);
  if (event.target.location == 'about:blank') {
    return;
  }
  this.clearSearchResults();
  this.addSearchResult("Ian McKellar", "", "http://ian.mckellar.org/",
      "http://ian.mckellar.org/favicon.ico", "this is a test");
}

// urlbar keypress handler
AwesomeSearch.urlbarOnKeyPress = function(event) {
  // ctrl-G mean Google
  if (String.fromCharCode(event.charCode) == 'g' && event.ctrlKey) {
    // clear the old results
    this.clearSearchResults();

    this.log(this.__AS_iframe);

    this.iframe.setAttribute('src', 'http://www.google.com/search?q=hello');

    // prevent the regular key handling
    event.preventDefault();
    event.stopPropagation();
  }
}


window.addEventListener('load', function() { AwesomeSearch.windowOnLoad() },
    false);
