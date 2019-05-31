function httpFun() {
    this.httpGet = function (siteUrl) {
      var https = require('https');
      var http = require('http');
      var client = http;
      if (siteUrl.includes("https")) {
        client = https;
      }
      var defer = protractor.promise.defer();
      //console.log(siteUrl);
      client.get(siteUrl, function (response) {
  
        var bodyString = '';
  
        response.setEncoding('utf8');
  
        response.on("data", function (chunk) {
          bodyString += chunk;
        });
  
        response.on('end', function () {
          defer.fulfill({
            statusCode: response.statusCode,
            bodyString: bodyString
          });
        });
  
      }).on('error', function (e) {
        defer.reject("Got http.get error: " + e.message);
      });
  
      return defer.promise;
    };
  
    this.fireHttpRequest = function (fullUrl) {
      var myCookie = "";
      return browser.wait(function () {
        var http = require('https');
        var defer = protractor.promise.defer();
        var urlObj = require('url').parse(fullUrl);
  
  
        var options = {
          hostname: urlObj.host,
          path: urlObj.path,
          method: 'GET'
        };
  
        var req = http.request(options, function (response) {
          var bodyString = '';
          response.setEncoding('utf8');
          response.on("data", function (chunk) {
            bodyString += chunk;
          });
  
          response.on('end', function () {
            defer.fulfill({
              statusCode: response.statusCode,
              bodyString: bodyString
            });
          });
  
        }).on('error', function (e) {
          defer.reject("Got http.get error: " + e.message);
        });
  
        req.end();
        return defer.promise;
      });
    };
  };
  module.exports = new httpFun();
  