// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Implements nsIAutoCompleteResult
function WebSearchAutoCompleteResult(searchString, searchResult,
                                  defaultIndex, errorDescription,
                                  results, comments) {
  this._searchString = searchString;
  this._searchResult = searchResult;
  this._defaultIndex = defaultIndex;
  this._errorDescription = errorDescription;
  this._results = results;
  this._comments = comments;
  dump('WebSearchAutoCompleteResult()\n');
}

WebSearchAutoCompleteResult.prototype = {
  _searchString: "",
  _searchResult: 0,
  _defaultIndex: 0,
  _errorDescription: "",
  _results: [],
  _comments: [],

  /**
   * The original search string
   */
  get searchString() {
    dump('get searchString: '+this._searchString+'\n');
    return this._searchString;
  },

  /**
   * The result code of this result object, either:
   *         RESULT_IGNORED   (invalid searchString)
   *         RESULT_FAILURE   (failure)
   *         RESULT_NOMATCH   (no matches found)
   *         RESULT_SUCCESS   (matches found)
   */
  get searchResult() {
    dump('get searchResult: '+this._searchResult+'\n');
    return this._searchResult
  },

  /**
   * Index of the default item that should be entered if none is selected
   */
  get defaultIndex() {
    dump('get defaultIndex: '+this._defaultIndex+'\n');
    return this._defaultIndex;
  },

  /**
   * A string describing the cause of a search failure
   */
  get errorDescription() {
    dump('get errorDescription: '+this._errorDescription+'\n');
    return this._errorDescription;
  },

  /**
   * The number of matches
   */
  get matchCount() {
    dump('get matchCount: '+this._results.length+'\n');
    return this._results.length;
  },

  /**
   * Get the value of the result at the given index
   */
  getValueAt: function(index) {
    dump('getValueAt('+index+'): '+this._results[index]+'\n');
    return this._results[index];
  },

  /**
   * Get the comment of the result at the given index
   */
  getCommentAt: function(index) {
    dump('getCommentAt('+index+'): '+this._comments[index]+'\n');
    return this._comments[index];
  },

  /**
   * Get the style hint for the result at the given index
   */
  getStyleAt: function(index) {
    dump('getStyleAt('+index+')\n')
    if (!this._comments[index])
      return null;  // not a category label, so no special styling

    if (index == 0)
      return "suggestfirst";  // category label on first line of results

    return "suggesthint";   // category label on any other line of results
  },

  getImageAt: function(index) {
    dump('getImageAt('+index+')\n');
  },

  /**
   * Remove the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   */
  removeValueAt: function(index, removeFromDb) {
    dump('removeValueAt\n');
    this._results.splice(index, 1);
    this._comments.splice(index, 1);
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteResult])
};


// Implements nsIAutoCompleteSearch
function WebSearchAutoCompleteSearch() {
  dump('WebSearchAutoCompleteSearch\n');
}

WebSearchAutoCompleteSearch.prototype = {
  // start a search
  startSearch: function(searchString, searchParam, previousResult, listener) {
    dump('startSearch: '+searchString+'\n');
    var results = ['http://www.google.com/','http://ian.mckellar.org/'];
    var comments = ['Google', 'Ian McKellar'];
    var newResult = new WebSearchAutoCompleteResult('',
        Ci.nsIAutoCompleteResult.RESULT_SUCCESS, 0, "", results, comments);
    listener.onSearchResult(this, newResult);
    dump('startSearch complete\n')
  },

  // Stop at search
  stopSearch: function() {
    dump('stopSearch')
  },

  // XPCOM registration
  classDescription: "AwesomeSearch Google AutoComplete",
  contractID: "@mozilla.org/autocomplete/search;1?name=as-google",
  classID: Components.ID("7ffb0fd2-b67d-48d8-b9d0-7069764cb448"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch])
};

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([WebSearchAutoCompleteSearch]);
}
