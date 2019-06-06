var deriva = require('../../utils/common/deriva-webapps');

exports.tests = function (appName, baseUrl) {
  describe('Static ' + appName, function() {
      var EC = protractor.ExpectedConditions;

      beforeAll(function() {
          browser.ignoreSynchronization = true;
          browser.get(baseUrl);
          pageTitle = element(by.id('anatomyHeading'));
          searchDiv = element(by.id('searchDiv'));
          actionBtn = element(by.id('expandCollapse'));

          deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
          browser.wait(EC.visibilityOf(pageTitle), browser.params.defaultTimeout);

      });

      describe('Title for the page', function() {
        it('should be visible', function() {
            expect(pageTitle.isDisplayed()).toBeTruthy('Page title is not visible.');
        });

        it('should be correct', function() {
            var expectedTitle = 'Mus musculus Anatomy Tree';
            expect(pageTitle.getText()).toEqual(expectedTitle);
        });
      });

      describe('Actions for the page', function() {

        it('dropdown value should be TS23: 15 dpc by default', function() {
          expect(element(by.id('number-button')).getText()).toEqual('TS23: 15 dpc');
        });

        it('input is  visible', function(){
          expect(searchDiv.isDisplayed()).toBeTruthy("Search box input is not visible when page loads initially.");
        });

        it('expand all and collapse all button are visible', function(){
          actionBtn.all(by.css('button')).then(function(buttons) {
            expect(buttons.length).toEqual(2, '2 buttons are not visible.');
            expect((buttons[0]).getText()).toEqual('Expand All', 'Expand All button is not correct.');
            expect((buttons[1]).getText()).toEqual('Collapse All', 'Collapse All button is not correct.');;
          });
        });
      });

      describe('Treeview', function() {

        it('it is displayed with no errors', function() {
          expect(element(by.id('jstree')).isDisplayed()).toBeTruthy('Treeview is not visible.');
          expect(element(by.id('error-message')).isDisplayed()).toBe(false);
        });
      });
  });
};
