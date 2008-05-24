/*
 *  Copyright © 2008 Ian McKellar <ian@mckellar.org>
 *
 *  This file is part of AwesomeSearch.
 *
 *  AwesomeSearch is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  AwesomeSearch is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with AwesomeSearch.  If not, see <http://www.gnu.org/licenses/>.
 */

// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// prefs service
const PREFS = Cc['@mozilla.org/preferences-service;1']
    .getService(Ci.nsIPrefBranch);

////////////////////////////////////////////////////////
// SearchBase: base class for all autocomplete searches

function SearchBase() { }
SearchBase.prototype.QueryInterface = XPCOMUtils.generateQI(
    [Ci.nsIAutoCompleteSearch, Ci.nsIAutoCompleteResult]);

// start a search
SearchBase.prototype.doStartSearch = 
function SearchBase_doStartSearch(searchString, searchParam, previousResult, 
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
SearchBase.prototype.startSearch = 
function SearchBase_startSearch(searchString, searchParam, previousResult, 
    listener) {
  return this.doStartSearch(searchString, searchParam, previousResult, 
      listener);
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
  return (index?'suggesthint':'suggestfirst') + ' awesomesearch ' +
    this._results[index].style;
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
  var result = {
    value: aValue,
    comment: aComment,
    image: aImage,
    style: aStyle
  };
  this._results.push(result);
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






////////////////////////////////////////////////////////
// WebSearchBase: a base class for all web searches

function WebSearchBase() { 
}
WebSearchBase.prototype = new SearchBase();

WebSearchBase.prototype.startSearch =
function WebSearchBase_startSearch(searchString, searchParam, previousResult, 
    listener) {
  if (this._xhr) {
    this._xhr.abort();
  }

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
  if (this._xhr.readyState == 4) {
    this.notifyListener(this.handleResponse());
    this._xhr.abort();
    this._xhr = null;
  }
}

WebSearchBase.prototype.onError = 
function WebSearchBase_onError(event) {
  this.notifyListener(false);
  this._xhr.abort();
  this._xhr = null;
}



////////////////////////////////////////////////////////
// Google search

const GOOGLE_API_KEY = 'ABQIAAAAB5EMLNLcl9tsZ4hqbawAfxRs0Gcr6QwT8A5mowOxfafuDSDZ8xRyV6raPQ50DzlWqr9-QcqYSI5gOg';
const GOOGLE_API_REFERRER = 'http://ianloic.com/';

// import JSON helper
Cu.import("resource://gre/modules/JSON.jsm");

// google search
GoogleSearch = function() { };
GoogleSearch.prototype = new WebSearchBase();
GoogleSearch.prototype.classDescription =
    'AwesomeSearch Google AutoComplete';
GoogleSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-google';
GoogleSearch.prototype.classID =
    Components.ID("7ffb0fd2-b67d-48d8-b9d0-7069764cb448");
GoogleSearch.prototype.QueryInterface = 
    XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch, 
        Ci.nsIAutoCompleteResult]);
GoogleSearch.prototype.makeRequest = function () {
  if (!PREFS.getBoolPref('awesomesearch.engine.google')) {
    this.notifyListener(false);
    return;
  }
  // FIXME: add referrer & api key?
  this._xhr.QueryInterface(Ci.nsIXMLHttpRequest);
  this._xhr.open('GET',
      'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' +
      encodeURIComponent(this.searchString), true);
  this._xhr.send(null);
}
GoogleSearch.prototype.handleResponse = function () {
  var data;
  try {
    data = JSON.fromString(this._xhr.responseText);
  } catch (e) {
    // if we get an error here let's handle it with a smile
    return false;
  }
  for (var i=0; i<data.responseData.results.length;i++) {
    var result = data.responseData.results[i];
    this.addResult(result.unescapedUrl, result.titleNoFormatting, 
        'http://www.google.com/favicon.ico', 'as-google');
  }
  return true;
}


////////////////////////////////////////////////////////
// Amazon search

AmazonSearch = function() { };
AmazonSearch.prototype = new WebSearchBase();
AmazonSearch.prototype.classDescription =
    'AwesomeSearch Amazon AutoComplete';
AmazonSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-amazon';
AmazonSearch.prototype.classID =
    Components.ID("4fa91144-0d6e-4914-9ff5-0c297e812e5f");
AmazonSearch.prototype.makeRequest = function () {
  if (!PREFS.getBoolPref('awesomesearch.engine.amazon')) {
    this.notifyListener(false);
    return;
  }
  this._xhr.QueryInterface(Ci.nsIXMLHttpRequest);
  this._xhr.open('GET',
                 'http://ecs.amazonaws.com/onca/xml?' +
                 'Service=AWSECommerceService&' +
                 'AWSAccessKeyId=1BTS253HGNBMVK0CP6G2&' +
                 'Operation=ItemSearch&SearchIndex=Blended&' +
                 'AssociateTag=httpianmckell-20&' +
                 'Version=2008-04-07&Keywords=' +
                 encodeURIComponent(this.searchString), true);
  this._xhr.send(null);
}
AmazonSearch.prototype.handleResponse = function () {
  if (this._xhr.responseXML == null) {
    return false;
  }
  var items = this._xhr.responseXML.getElementsByTagName('Item');
  for (var i=0; i<items.length; i++) {
    var item = items[i];
    this.addResult(item.getElementsByTagName('DetailPageURL')[0].textContent, 
        item.getElementsByTagName('Title')[0].textContent,
        'http://www.amazon.com/favicon.ico', 'as-amazon');
  }
  return true;
}

////////////////////////////////////////////////////////
// OpenSearch

OpenSearch = function() { 
  this._searchService = Cc['@mozilla.org/browser/search-service;1']
    .getService(Ci.nsIBrowserSearchService);
};
OpenSearch.prototype = new SearchBase();
OpenSearch.prototype.classDescription =
    'OpenSearch AutoComplete';
OpenSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-opensearch';
OpenSearch.prototype.classID =
    Components.ID('9462837b-6ab3-439e-b0a8-4e10ac6430fb');
OpenSearch.prototype.startSearch =
function OpenSearch_startSearch(searchString, searchParam, previousResult, 
    listener) {
  if (!PREFS.getBoolPref('awesomesearch.engines-enabled')) {
    this.notifyListener(false);
    return;
  }
  this.doStartSearch(searchString, searchParam, previousResult, listener);
  this.clearResults();
  var engines = this._searchService.getVisibleEngines({ });
  for (var i=0; i<engines.length; i++) {
    var submission = engines[i].getSubmission(searchString, 'text/html');
    this.addResult(submission.uri.spec, 
        'Search for "'+searchString+'" on '+engines[i].name, 
        engines[i].iconURI.spec,
        'suggesthint awesomesearch as-opensearch');
  }
  this.notifyListener(true);
}

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([GoogleSearch, AmazonSearch, OpenSearch]);
}
