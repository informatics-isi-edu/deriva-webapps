//********************* boolean search *************************//
var navbar = require('./boolean-search/00-navbar.spec.js');
var treeview = require('./boolean-search/00-treeview.spec.js');
var booleansearch = require('./boolean-search/00-boolean-search.spec.js');
//********************* boolean search *************************//


var testConfig = require('../config');
var urlList = testConfig.getEnvUrl(browser.params.exeEnv);
var appName = browser.params.app;

switch(appName){
    case "heatmap":
        heatmap(urlList, appName);
        break;
    case "boolean-search":
        booleanSearch(urlList, appName);
        break;
    default:
        heatmap(urlList, "heatmap");
        booleanSearch(urlList, "boolean-search");
        break;
}

function heatmap(urlList, appName){
    console.log("run heatmap test cases");
    urlList.forEach(function(ele){
        // write actual test cases for heatmap
    });
}

function booleanSearch(urlList, appName){
    console.log("Running boolean-search test cases");
    urlList.forEach(function(ele){
        var url = ele.url+'/'+appName;
        navbar.tests(appName, url);
        treeview.tests(appName, url);
        booleansearch.tests(appName, url);
    });

}
