var heatmapSpec = require('./heatmaps/00-heatmap.spec');
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
        heatmapSpec.heatmap(ele.app, ele.url);
    });
}

function booleanSearch(){
    console.log("run boolean-search test cases");
    urlList.forEach(function(ele){
        // write actual test cases for boolean-search
    });
}
