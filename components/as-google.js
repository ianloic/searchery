// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const GOOGLE_API_KEY = 'ABQIAAAAB5EMLNLcl9tsZ4hqbawAfxRs0Gcr6QwT8A5mowOxfafuDSDZ8xRyV6raPQ50DzlWqr9-QcqYSI5gOg';
const GOOGLE_API_REFERRER = 'http://ianloic.com/';

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
// import JSON utils
Cu.import("resource://gre/modules/JSON.jsm");


// Implements nsIAutoCompleteSearch
function BaseAutoCompleteSearch() {}

BaseAutoCompleteSearch.prototype = {
  // start a search
  startSearch: function(searchString, searchParam, previousResult, listener) {
    // set state
    this.searchString = searchString;
    this.defaultIndex = 0;
    this.matchCount = 0;
    this.searchResult = 0;
    this._results = []

    // save off the listener
    this._listener = listener;

    // create an XMLHttpRequest object to talk to the server
    this._xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

    // add event handlers
    this._xhr.QueryInterface(Ci.nsIDOMEventTarget);
    var self = this;
    this._xhr.addEventListener("load", function(evt) { self._onLoad(evt); },
                               false);
    this._xhr.addEventListener("error", function(evt) { self._onError(evt); },
                               false);

    // make the request
    this.makeRequest();

  },

  // Stop at search
  stopSearch: function() {
    if (this._xhr) {
      this._xhr.abort();
    }
  },

  _onLoad: function(event) {
    this._results = [];
    if (this.handleResponse()) {
      this.matchCount = this._results.length;
      this.searchResult = Ci.nsIAutoCompleteResult.RESULT_SUCCESS;
      this._listener.onSearchResult(this, this);
      this._xhr = null;
    } else {
      this.matchCount = 0;
      this.searchResult = Ci.nsIAutoCompleteResult.RESULT_FAILURE;
      this._results = [];
      this._listener.onSearchResult(this, this);
      this._xhr = null;
    }
  },

  _onError: function(event) {
    this.matchCount = 0;
    this.searchResult = Ci.nsIAutoCompleteResult.RESULT_FAILURE;
    this._results = [];
    this._listener.onSearchResult(this, this);
    this._xhr = null;
  },

  getCommentAt: function(index) {
    if (!this._results || index >= this._results.length) {
      return null;
    }
    return this._results[index].comment;
  },

  getImageAt: function(index) {
    if (!this._results || index >= this._results.length) {
      return null;
    }
    return this._results[index].image;
  },

  getStyleAt: function(index) {
    if (!this._results || index >= this._results.length) {
      return null;
    }
    return this._results[index].style;
  },

  getValueAt: function(index) {
    if (!this._results || index >= this._results.length) {
      return null;
    }
    return this._results[index].value;
  },

  removeValueAt: function(index, removeFromDb) {
    // FIXME: implement? why?
  },

  // XPCOM registration
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch,
      Ci.nsIAutoCompleteResult])
};

GoogleAutoCompleteSearch = function() { };
GoogleAutoCompleteSearch.prototype = new BaseAutoCompleteSearch();
GoogleAutoCompleteSearch.prototype.classDescription =
    'AwesomeSearch Google AutoComplete';
GoogleAutoCompleteSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-google';
GoogleAutoCompleteSearch.prototype.classID =
    Components.ID("7ffb0fd2-b67d-48d8-b9d0-7069764cb448");
GoogleAutoCompleteSearch.prototype.makeRequest = function () {
  this._xhr.QueryInterface(Ci.nsIXMLHttpRequest);
  this._xhr.open('GET',
      'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' +
      encodeURIComponent(this.searchString), true);
  this._xhr.send(null);
}
GoogleAutoCompleteSearch.prototype.handleResponse = function () {
  var data;
  try {
    data = JSON.fromString(this._xhr.responseText);
  } catch (e) {
    // if we get an error here let's handle it with a smile
    return false;
  }
  for (var i=0; i<data.responseData.results.length;i++) {
    var result = data.responseData.results[i];
    this._results.push({
      value: result.unescapedUrl,
      comment: result.titleNoFormatting,
      image: 'http://www.google.com/favicon.ico',
      style: (i?'suggesthint':'suggestfirst') + ' awesomesearch as-google'
    });
  }
  return true;
}

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([GoogleAutoCompleteSearch]);
}
