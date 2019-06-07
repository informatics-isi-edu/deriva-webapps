var httpFun = require('../../utils/common/httpFun.js');
var deriva = require('../../utils/common/deriva-webapps');

exports.tests = function (appName, baseUrl) {
  describe(appName + ' TreeView', function () {
    var EC = protractor.ExpectedConditions;

    beforeAll(function () {
      browser.ignoreSynchronization=true;
      browser.get(baseUrl);
      iframe = element(by.css('.treeview-panel'));

      deriva.waitForElementInverse(element.all(by.id("spinner")).get(0));
    });

    it('verify that treeview are displayed', function () {
      if (iframe.isElementPresent(by.tagName('object'))) {
        leftPanelIframe = iframe.element(by.tagName('object'));
        leftPanelIframe.getAttribute('data').then(function (iframeUrl) {
          return httpFun.fireHttpRequest(iframeUrl)
        }).then(function (res) {
          expect(res.statusCode).toEqual(200);
        }).catch(function (err) {
          console.log("Error in promise chain: ", err);
        });
      }
    });
  });
};
