// these constants make everything better
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// import the XPCOM helper
Cu.import("resource://gre/modules/XPCOMUtils.jsm");




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






////////////////////////////////////////////////////////
// WebSearchBase: a base class for all web searches

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



////////////////////////////////////////////////////////
// Google search

const GOOGLE_API_KEY = 'ABQIAAAAB5EMLNLcl9tsZ4hqbawAfxRs0Gcr6QwT8A5mowOxfafuDSDZ8xRyV6raPQ50DzlWqr9-QcqYSI5gOg';
const GOOGLE_API_REFERRER = 'http://ianloic.com/';

// import JSON helper
Cu.import("resource://gre/modules/JSON.jsm");

// google search
GoogleSearch = function() { 
  dump("registered, let's try to import stuff\n");
  try {
    Cu.import("resource://awesomesearch/modules/web-search-base.jsm");
  } catch(e) {
    dump('exception: '+e+'\n');
  }
  dump("imported, ok?\n");
};
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
    this._results.push({
      value: result.unescapedUrl,
      comment: result.titleNoFormatting,
      image: 'http://www.google.com/favicon.ico',
      style: (i?'suggesthint':'suggestfirst') + ' awesomesearch as-google'
    });
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
    dump('eek! no responseXML for:\n'+this._xhr.responseText+'\n');
  }
  var items = this._xhr.responseXML.getElementsByTagName('Item');
  for (var i=0; i<items.length; i++) {
    var item = items[i];
    this._results.push({
      value: item.getElementsByTagName('DetailPageURL')[0].textContent,
      comment: item.getElementsByTagName('Title')[0].textContent,
      image: 'http://www.amazon.com/favicon.ico',
      style: (i?'suggesthint':'suggestfirst') + ' awesomesearch as-amazon'
    })

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
