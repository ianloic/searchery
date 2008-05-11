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
function BaseAutoCompleteSearch() {
}

// google search
GoogleAutoCompleteSearch = function() { 
};
GoogleAutoCompleteSearch.prototype = new BaseAutoCompleteSearch();
GoogleAutoCompleteSearch.prototype.classDescription =
    'AwesomeSearch Google AutoComplete';
GoogleAutoCompleteSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-google';
GoogleAutoCompleteSearch.prototype.classID =
    Components.ID("7ffb0fd2-b67d-48d8-b9d0-7069764cb448");
GoogleAutoCompleteSearch.prototype.makeRequest = function () {
  // FIXME: add referrer & api key?
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

// amazon search
AmazonAutoCompleteSearch = function() {
  };
AmazonAutoCompleteSearch.prototype = new BaseAutoCompleteSearch();
AmazonAutoCompleteSearch.prototype.classDescription =
    'AwesomeSearch Amazon AutoComplete';
AmazonAutoCompleteSearch.prototype.contractID =
    '@mozilla.org/autocomplete/search;1?name=as-amazon';
AmazonAutoCompleteSearch.prototype.classID =
    Components.ID("4fa91144-0d6e-4914-9ff5-0c297e812e5f");
AmazonAutoCompleteSearch.prototype.makeRequest = function () {
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
AmazonAutoCompleteSearch.prototype.handleResponse = function () {
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

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([GoogleAutoCompleteSearch,
                                    AmazonAutoCompleteSearch]);
}
