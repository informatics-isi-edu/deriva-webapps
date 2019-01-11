
"use strict";

var Q = require ("q");
var request = require("request");
var qs = require('querystring');
var url = require('url');

/**
 * A list of methods to create denodeified versions
 * @type {string[]}
 */
var REQUEST_METHODS = [
    "del",
    "delete",
    "get",
    "head",
    "patch",
    "post",
    "put"
];

var formatUrl = function(uri, params) {
    uri = url.parse(uri);
    var queryString = qs.parse(uri.query);
    for (var k in params) {
        queryString[k] = params[k];
    }
    uri.search = qs.stringify(queryString);
    return url.format(uri);
};

/**
 * Q-wrapped request constructor
 * @param {Object} [defaults] Default values
 * @constructor
 */
function QRequest(defaults) {

    if (null == defaults) defaults = QRequest.defaults;
    /**
     * The raw request object with optional defaults
     */
    this.raw = request.defaults(defaults);
}

QRequest.defaults = {};

// Create denodeified methods for request shortcuts
REQUEST_METHODS.forEach(function(method) {
    QRequest.prototype[method] = function () {
        var result = Q.defer();
        var fArgs = Array.prototype.slice.call(arguments, 0);

        var self = this;
        var max_retries = 10, delay = 100, count = 0;
        
        function asyncfn() {
            self.raw[method].apply(self.raw, fArgs)
        };

        fArgs.push(function (err, response, body) {

            response = response || {};

            var headers = function(headerName) {
                if (headerName) return response.headers[headerName];
                return response.headers;
            };

            response.status = response.status || response.statusCode;
            if (QRequest.defaults._retriable_error_codes && (QRequest.defaults._retriable_error_codes.indexOf(response.status) != -1) && count < max_retries) {
                count += 1;
                setTimeout(asyncfn, delay);
                delay *= 2;
            } else {
                if (null != err) {
                    result.reject({ data: err, headers: headers });
                } else if (response.statusCode < 200 || response.statusCode >= 400) {
                    result.reject({ data: body, statusCode: response.statusCode, headers: headers });
                } else {
                    result.resolve({ data: body, headers: headers });
                }
            }
        });
        if (method == 'delete') method = 'del';
        asyncfn();
        return result.promise;
    };

    QRequest[method] = function() {
        var request = new QRequest(this.defaults);
        var args = Array.prototype.slice.call(arguments, 0);
        if ((method == 'post' || method == 'put') && (typeof args[1] == 'object')) {
            var obj = {};

            if (args[2] && typeof args[2] == 'object') {
                if (args[2].params) args[0] = formatUrl(args[0], args[2].params);
                obj = args[2];
                args.splice(2, 1);
            }
            obj.url = args[0];

            var objectConstructor = {}.constructor;
            var arrayConstructor = [].constructor;

            if ((typeof args[1] == 'object') && ((args[1].constructor === objectConstructor) || (args[1].constructor === arrayConstructor))) {
                obj.json = args[1];
            }  else  {
                obj.body = args[1];
                obj.json = false;
            }

            args[0] = obj;
            args.splice(1, 1);
        } else if ((method == 'get' || method == 'delete' || method == 'head') && (typeof args[1] == 'object')) {
            var obj = args[1];
            obj.url = formatUrl(args[0], args[1].params);
            args.splice(1,1);
            args[0] = obj;
        } else if (method =="post" || method =="put") {
            var obj = {};
            if (args[2] && typeof args[2] == 'object') {
                if (args[2].params) args[0] = formatUrl(args[0], args[2].params);
                obj = args[2];
                args.splice(2, 1);
            }
            obj.url = args[0];
        }

        return request[method].apply(request, args);
    }
});

/**
 * Reference to original raw request
 */
QRequest.raw = request;

/**
 * Returns a function to check the response has a valid status code
 * @param {(Number|Number[])} permittedStatus
 * @returns {Function}
 */
QRequest.bodyIfStatusOk = function(permittedStatus) {
    if (false === Array.isArray(permittedStatus)) {
        permittedStatus = [permittedStatus];
    }
    return function(response, body) {
        if (permittedStatus.indexOf(response.statusCode) < 0) {
            throw new RangeError("Invalid response status: " + response.statusCode);
        }
        return body;
    };
};

/**
 * Returns request body if response status code is 200
 * @returns {Function}
 */
QRequest.body = function(response, body) {
    return QRequest.bodyIfStatusOk(200)(response, body);
};

QRequest.setDefaults = function(defaults) {
    this.defaults = defaults || {}; 
};

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

Array.prototype.intersect = function( array ) {
    // this is naive--could use some optimization
    var result = [];
    for ( var i = 0; i < this.length; i++ ) {
        if ( array.contains(this[i]) && !result.contains(this[i]) )
            result.push( this[i] );
    }
    return result;
}

module.exports = QRequest;
