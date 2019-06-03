var deriva = require('../../utils/common/deriva-webapps');
var expectedValue = require('./navbar-expected-value.js');

exports.tests = function (appName, baseUrl) {
  describe(appName + ' Navbar ', function() {
      var navbar, derivaConfig, EC = protractor.ExpectedConditions;

      beforeAll(function () {
          browser.ignoreSynchronization=true;
          browser.get(baseUrl);
          navbar = element(by.id('mainnav'));
          pageSubTitle = deriva.booleanSearchPage.getPageTitleElement();

          deriva.waitForElementInverse(element.all(by.id("spinner")).get(0));
          browser.wait(EC.visibilityOf(pageSubTitle), browser.params.defaultTimeout);

      });

      it('should be visible', function() {
          expect(navbar.isDisplayed()).toBeTruthy('Navbar is not visible.');
      });

      it('should display the right branded text', function() {
          var actualBrandText = element(by.id('brand-text'));
          var expectedBrandText = 'RBK/GUDMAP Resources';

          expect(actualBrandText.getText()).toEqual(expectedBrandText);
      });

      it('page sub-title should be "' + expectedValue.pageSubTitle + '"', function () {
        expect(pageSubTitle.getText()).toEqual(expectedValue.pageSubTitle, "Page sub-title is incorrect for Boolean Seach Page")
      });

      it('should have all the nav bar links', function (done) {
        deriva.booleanSearchPage.getNavBarLinks().then(function (columns) {
          var colNames = [];
          for (var i = 0; i < columns.length; i++) {
            (function (index) {
              columns[index].getText().then(function (text) {
                colNames[index] = text;
              });
            }(i))
          }
          return colNames;
        }).then(function (headers) {
          expect(headers.length).toEqual(expectedValue.navbarOptions.length, "number of nodes present does not match what's defined in "+appName+"-config");
          for (var i = 0; i < expectedValue.navbarOptions.length; i++) {
            expect(headers).toContain(expectedValue.navbarOptions[i], expectedValue.navbarOptions[i] + " nav link is not present.");
          }
          done();
        }).catch(function (err) {
          console.log("Error in promise chain: ", err);
          done.fail(err);
        });
      });
  });
};
