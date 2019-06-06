var httpFun = require('../../utils/common/httpFun.js');
var deriva = require('../../utils/common/deriva-webapps');
var testConfig = require('../../config');

exports.tests = function (appName, baseUrl) {
  describe('Record page '+ appName, function () {
    var EC = protractor.ExpectedConditions;

    beforeAll(function () {
      browser.ignoreSynchronization=true;
      browser.get(baseUrl+testConfig.treeviewPage.recordpage);
      ele = element(by.id('rt-heading-Specimen&nbsp;Expression'));

      deriva.waitForElementInverse(element.all(by.id("rt-loading")).get(0));
      browser.wait(EC.visibilityOf(ele), browser.params.defaultTimeout);

    });

    it('verify that treeview are displayed', function () {
      if (ele.isElementPresent(by.tagName('iframe'))) {
        iframe = ele.element(by.tagName('iframe'));
        iframe.getAttribute('src').then(function (iframeUrl) {
          httpFun.fireHttpRequest(iframeUrl).then(function (res) {
            expect(res.statusCode).toEqual(200);
          }).catch(function (err) {
            console.log("Error in promise chain: ", err);
          });
        });
      }
    });

    describe('verify that treeview data displayed', function () {
      beforeAll(function () {
        browser.switchTo().frame(element(by.tagName('iframe')).getWebElement());
        rightPanel = element(by.id('right'));
        leftPanel = element(by.id('left'));
      });

      it('right panel is visible', function() {
        expect(rightPanel.isDisplayed()).toBeTruthy("Right panel is not visible.");
      });

      it('left panel is visible', function() {
        expect(leftPanel.isDisplayed()).toBeTruthy("Left panel is not visible.");
      });

    });

  });
};
