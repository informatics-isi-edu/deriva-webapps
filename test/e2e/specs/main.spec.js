//********************* boolean search *************************//
var navbar = require('./boolean-search/00-navbar.spec.js');
var treeview = require('./boolean-search/00-treeview.spec.js');
var booleansearch = require('./boolean-search/00-boolean-search.spec.js');
//********************* boolean search *************************//

//********************* treeview *************************//
var statictreeview = require('./treeview/00-static-treeview.spec.js');
var dynamictreeview = require('./treeview/00-dynamic-treeview.spec.js');
var recordpage = require('./treeview/00-record-page.spec.js');
//********************* treeview *************************//

var heatmapSpec = require('./heatmap/00-heatmap.spec');

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
    case "treeview":
        treeView(urlList, appName);
        break;
    default:
        heatmap(urlList, "heatmap");
        booleanSearch(urlList, "boolean-search");
        treeView(urlList, "treeview");
        break;
}

function heatmap(urlList, appName){
    console.log("run heatmap test cases");
    urlList.forEach(function(ele){
        // write actual test cases for heatmap
        heatmapSpec.heatmap(ele.app, ele.url);
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

function treeView(urlList, appName){
    console.log("Running treeview test cases");
    urlList.forEach(function(ele){
        var url = ele.url+'/'+appName;
        statictreeview.tests(appName, url);
        // dynamictreeview.tests(appName, url);
        // recordpage.tests(appName, 'https://dev.rebuildingakidney.org'); // TODO: Need to fetch from config
    });
}
