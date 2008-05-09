// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Implements nsIAutoCompleteSearch
function SearchBase() {}

SearchBase.prototype = {
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
  },

  // Stop at search
  stopSearch: function() {
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

  clearResults: function() {
    this._results = [];
  },

  addResult: function(aValue, aComment, aImage, aStyle) {
    this._results.push({
      value: aValue,
      comment: aComment,
      image: aImage,
      style: aStyle
    });
  },

  notifyListener: function(aSucceeded) {
    if (aSucceeded) {
      this.matchCount = this._results.length;
      this.searchResult = Ci.nsIAutoCompleteResult.RESULT_SUCCESS;
      this._listener.onSearchResult(this, this);
    } else {
      this.matchCount = 0;
      this.searchResult = Ci.nsIAutoCompleteResult.RESULT_FAILURE;
      this._results = [];
      this._listener.onSearchResult(this, this);
    }
  },

  // XPCOM registration
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch,
      Ci.nsIAutoCompleteResult, Ci.ilISearchBase])
};

