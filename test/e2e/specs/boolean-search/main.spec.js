var navbar = require('./all-features/navbar/00-navbar.spec.js');
var treeview = require('./all-features/treeview/00-treeview.spec.js');
var booleanSearch = require('./all-features/boolean-search/00-boolean-search.spec.js');

var testConfig = require('../config.js');

var urlList = testConfig.getEnvUrl(browser.params.exeEnv);
urlList.forEach(function (ele) {
  navbar.tests(ele.app, ele.url);
  treeview.tests(ele.app, ele.url);
  booleanSearch.tests(ele.app, ele.url);
});
