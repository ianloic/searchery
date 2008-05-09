// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Implements nsIAutoCompleteSearch
function SearchBase() {}
SearchBase.prototype.classDescription = 'AwesomeSearch Base Class';
SearchBase.prototype.contractID = '@ianloic.com/awesomesearch/base;1';
SearchBase.prototype.classID = 
    Components.ID("644c1c57-5348-40b2-a78d-4c9df262845d");

// start a search
SearchBase.prototype.startSearch = 
function SearchBase_startSearch(searchString, searchParam, previousResult, 
    listener) {
  // set state
  this.searchString = searchString;
  this.defaultIndex = 0;
  this.matchCount = 0;
  this.searchResult = 0;
  this._results = []

  // save off the listener
  this._listener = listener;
}

// Stop at search
SearchBase.prototype.stopSearch = 
function SearchBase_stopSearch() {
}

SearchBase.prototype.getCommentAt =
function SearchBase_getCommentAt(index) {
  if (!this._results || index >= this._results.length) {
    return null;
  }
  return this._results[index].comment;
}

SearchBase.prototype.getImageAt =
function SearchBase_getImageAt(index) {
  if (!this._results || index >= this._results.length) {
    return null;
  }
  return this._results[index].image;
}

SearchBase.prototype.getStyleAt =
function SearchBase_getStyleAt(index) {
  if (!this._results || index >= this._results.length) {
    return null;
  }
  return this._results[index].style;
}

SearchBase.prototype.getValueAt =
function SearchBase_getValueAt(index) {
  if (!this._results || index >= this._results.length) {
    return null;
  }
  return this._results[index].value;
},

SearchBase.prototype.removeValueAt =
function SearchBase_removeValueAt(index, removeFromDb) {
}

SearchBase.prototype.clearResults =
function SearchBase_clearResults() {
  this._results = [];
},

SearchBase.prototype.addResult =
function SearchBase_addResult(aValue, aComment, aImage, aStyle) {
  this._results.push({
    value: aValue,
    comment: aComment,
    image: aImage,
    style: aStyle
  });
},

SearchBase.prototype.notifyListener =
function SearchBase_notifyListener(aSucceeded) {
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
}

// XPCOM registration
SearchBase.prototype.QueryInterface = XPCOMUtils.generateQI(
    [Ci.nsIAutoCompleteSearch, Ci.nsIAutoCompleteResult, Ci.ilISearchBase]);


function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([SearchBase]);
}
