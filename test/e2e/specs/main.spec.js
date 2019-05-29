var heatmap = require('./heatmaps/00-heatmap.spec');
var testConfig = require('../config');

var urlList = testConfig.getEnvUrl(browser.params.exeEnv);

urlList.forEach(function(ele){
    heatmap.heatmap(ele.app, ele.url);
})