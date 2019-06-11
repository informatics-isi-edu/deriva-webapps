var deriva = require('../../utils/common/deriva-webapps');
var expectedValue = require('./static-treeview-expected-value.js');

exports.tests = function (appName, baseUrl) {
  describe('Static ' + appName, function() {
      var EC = protractor.ExpectedConditions;

      beforeAll(function() {
          browser.ignoreSynchronization = true;
          browser.get(baseUrl);
          pageTitle = element(by.id('anatomyHeading'));
          searchDiv = element(by.id('searchDiv'));
          actionBtn = element(by.id('expandCollapse'));
          filterDropDown = element(by.id('filterDropDown'));
          searchInput = element(by.id('plugins4_q'));

          deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
          browser.wait(EC.visibilityOf(pageTitle), browser.params.defaultTimeout);

      });

      describe('title and dropdown for the page', function() {
        it('title should be visible', function() {
            expect(pageTitle.isDisplayed()).toBeTruthy('Page title is not visible.');
        });

        it('title should be correct', function() {
            var expectedTitle = 'Mus musculus Anatomy Tree';
            expect(pageTitle.getText()).toEqual(expectedTitle);
        });

        it('dropdown value should be TS23: 15 dpc by default', function() {
          expect(element(by.id('number-button')).getText()).toEqual('TS23: 15 dpc');
        });

        it('input is  visible', function(){
          expect(searchDiv.isDisplayed()).toBeTruthy("Search box input is not visible when page loads initially.");
        });

      });

      describe('actions for the page', function() {
        beforeAll(function() {
          browser.wait(EC.elementToBeClickable(filterDropDown), browser.params.defaultTimeout);
          filterDropDown.click();
          browser.wait(EC.visibilityOf(element(by.id('number-menu'))), browser.params.defaultTimeout)
          element(by.id('ui-id-2')).click();

          deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));

        });

        it('all node list collapse on `Collapse All` click', function(done) {
          actionBtn.all(by.css('button')).then(function(buttons) {
            buttons[1].click().then(function() {
              expect(element(by.id('jstree')).all(by.css('.jstree-open')).count()).toBe(0);
              done();
            });
          }).catch(function(err) {
            console.log(err);
          });
        });


        it('all node list expand on `Expand All` click', function(done) {
          actionBtn.all(by.css('button')).then(function(buttons) {
            buttons[0].click().then(function() {
              expect(element(by.id('jstree')).all(by.css('.jstree-open')).count()).toBe(4);
              done();
            });
          }).catch(function(err) {
            console.log(err);
          });
        });

      });

      it('expand all and collapse all button are visible', function(){
        actionBtn.all(by.css('button')).then(function(buttons) {
          expect(buttons.length).toEqual(2, '2 buttons are not visible.');
          expect((buttons[0]).getText()).toEqual('Expand All', 'Expand All button is not correct.');
          expect((buttons[1]).getText()).toEqual('Collapse All', 'Collapse All button is not correct.');;
        }).catch(function(err) {
          console.log(err);
        });
      });

      it('collapsing the parent should retain the highlighted searched item', function() {
        searchInput.sendKeys('second');
        var ele = element.all(by.css('.jstree-open .jstree-search')).get(0);
        browser.wait(EC.presenceOf(ele), browser.params.defaultTimeout);
        element.all(by.css('.jstree-open > i')).get(0).click();
        element.all(by.css('.jstree-closed > i')).get(0).click();
        browser.wait(EC.presenceOf(ele), browser.params.defaultTimeout);
        // expect(deriva.elementInViewport(ele)).toBeTruthy('searched node of the tree is not visible.');
        expect(element.all(by.css('.jstree-node .jstree-search')).get(0).getCssValue('background-color')).toBe('rgba(239, 239, 166, 1)');
        expect(element.all(by.css('.jstree-node .jstree-search')).get(0).getCssValue('font-style')).toBe('italic');
      });


      it('search `mouse (EMAPA:25765)` takes the scroll to it and is in italics and highlighted', function() {
        searchInput.clear();
        searchInput.sendKeys('mouse (EMAPA:25765)');
        var ele = element.all(by.css('.jstree-node .jstree-search')).get(0);
        browser.wait(EC.presenceOf(ele), browser.params.defaultTimeout);

        // expect(deriva.elementInViewport(ele)).toBeTruthy('searched node of the tree is not visible.');
        expect(ele.getCssValue('background-color')).toBe('rgba(239, 239, 166, 1)');
        expect(ele.getCssValue('font-style')).toBe('italic');
      });

      it('filter terms for a specific Theiler Stage: Refereshes on stage change', function(done) {
        browser.wait(EC.elementToBeClickable(filterDropDown), browser.params.defaultTimeout);
        filterDropDown.click();
        element(by.id('number-menu')).all(by.tagName('li')).each(function(ele) {
          browser.wait(EC.elementToBeClickable(ele), browser.params.defaultTimeout);
          ele.getText().then(function(text) {
             expect(expectedValue.dropdown).toContain(text, 'dropdown does not contain text.');
           });
           done();
        }).catch(function (err) {
            done.fail();
            console.log(err);
        });

        element(by.id('ui-id-30')).click().then(function() {
          return deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
        }).then(function() {
            expect(element(by.id('jstree')).isDisplayed()).toBeTruthy('Treeview is not visible.');
            expect(element(by.id('error-message')).isDisplayed()).toBe(false);
            done();
        }).catch(function (err) {
            done.fail();
            console.log(err);
        });
      });

      describe('treeview', function() {

        it('it is displayed with no errors', function() {
          expect(element(by.id('jstree')).isDisplayed()).toBeTruthy('Treeview is not visible.');
          expect(element(by.id('error-message')).isDisplayed()).toBe(false);
        });

        describe('hierarchy', function() {
          beforeAll(function() {
            btn = element(by.css('#nid_9112 > i'));
            deriva.waitForElement(btn);
          });

          it('node list expanded on + click', function() {
            btn.click();
            browser.wait(EC.visibilityOf(element(by.css('#nid_9112 > ul'))), browser.params.defaultTimeout);
            element(by.css('#nid_9112')).all(by.tagName('li')).each(function (elm) {
              expect((elm).isDisplayed()).toBeTruthy('Expanded List list is not visible.');
            });
          });

          it('node list collapse on - click', function() {
            btn.click();
            expandedList = element(by.css('#nid_9112 > ul'));
            browser.wait(EC.invisibilityOf(expandedList), browser.params.defaultTimeout);
            expect((expandedList).isPresent()).toBeFalsy();
          });
        });
      });
  });
};
