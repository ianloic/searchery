// only export WebSearchBase
var EXPORTED_SYMBOLS = ['WebSearchBase'];

// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the super classs
Cu.import("resource://awesomesearch/modules/search-base.jsm");

function WebSearchBase() { 
}
WebSearchBase.prototype = new SearchBase();

WebSearchBase.prototype.startSearch =
function WebSearchBase_startSearch(searchString, searchParam, previousResult, 
    listener) {
  this.doStartSearch(searchString, searchParam, previousResult, listener);

  // create an XMLHttpRequest object to talk to the server
  this._xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

  // add event handlers
  this._xhr.QueryInterface(Ci.nsIDOMEventTarget);
  var self = this;
  this._xhr.addEventListener("load", function(evt) { self.onLoad(evt); },
                             false);
  this._xhr.addEventListener("error", function(evt) { self.onError(evt); },
                             false);

  // make the request
  this.makeRequest();
}

WebSearchBase.prototype.onLoad = 
function WebSearchBase_onLoad(event) {
  this.notifyListener(this.handleResponse());
  this._xhr = null;
}

WebSearchBase.prototype.onError = 
function WebSearchBase_onError(event) {
  this.notifyListener(false);
  this._xhr = null;
}
