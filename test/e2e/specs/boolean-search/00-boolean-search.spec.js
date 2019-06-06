var deriva = require('../../utils/common/deriva-webapps');
var expectedValue = require('./boolean-search-expected-value.js');

exports.tests = function (appName, baseUrl) {
  describe('Boolean Search', function() {

      beforeAll(function() {
          browser.ignoreSynchronization = true;
          browser.get(baseUrl);
          deriva.waitForElementInverse(element.all(by.id("spinner")).get(0));
      });

      describe("For side panel table of contents", function() {

          beforeAll(function() {
              fiddlerBtn = deriva.booleanSearchPage.getSidePanelFiddler();
              deriva.waitForElement(fiddlerBtn);
          });

          it('Table of contents should be displayed by default', function(){
              var sidePan = deriva.booleanSearchPage.getSidePanel();
              expect(sidePan.isDisplayed()).toBeTruthy("Side Panel is not visible when page loads initially.");
          });

          it('Side panel should hide/show by clicking pull button', function(done){
              var recPan =  deriva.booleanSearchPage.getSidePanel();
              recPan.allowAnimations(false);

              fiddlerBtn.getAttribute("class").then(function(classNameLeft) {
                expect(classNameLeft).toContain("glyphicon glyphicon-triangle-left", "Side Panel Pull button is not pointing in the left direction.");
                expect(recPan.getAttribute("class")).toContain('open-panel', 'Side Panel is not hidden when fiddler is poining in left direction.');

                  return fiddlerBtn.click();
              }).then(function(){
                expect(fiddlerBtn.getAttribute("class")).toContain('glyphicon glyphicon-triangle-right', 'Side Panel Pull button is not pointing in the right direction.');
                expect(recPan.getAttribute("class")).toContain('close-panel', 'Side Panel is not visible when fiddler is poining in right direction.');

                  done();
              }).catch( function(err) {
                  console.log(err);
                  done.fail();
              });
          });

      });

      describe("Search box", function() {

          beforeAll(function() {
            searchBox = element(by.id('filtersInput'));
            submitBtn = deriva.booleanSearchPage.getSubmitButton();

            deriva.waitForElement(searchBox);
          });

          it('input is  visible', function(){
            expect(searchBox.isDisplayed()).toBeTruthy("Search box input is not visible when page loads initially.");
          });

          it('submit button is visible', function(){
            expect(submitBtn.isDisplayed()).toBeTruthy("Search box submit button is not visible when page loads initially.");
          });
      });

      describe("Table content", function() {

          beforeAll(function() {
              firstRow = deriva.booleanSearchPage.getFirstRow();
              columnNames = deriva.booleanSearchPage.getColumnNames();
          });

          it('should have table headers: Strength, In Anatomical Source, Stages, With Pattern, At Location, Actions', function(done) {

            columnNames.then(function (columns) {
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
              for (var i = 0; i < expectedValue.tableHeaders.length; i++) {
                expect(headers).toContain(expectedValue.tableHeaders[i], expectedValue.tableHeaders[i] + " column is not present in the table.");
              }
              done();
            }).catch(function (err) {
              console.log("Error in promise chain: ", err);
              done.fail(err);
            });
          });

          it('default first row is visible', function() {
            expect(firstRow.isDisplayed()).toBeTruthy("First row is not visible when page loads initially.");
          });

          it('default value of "Strength" should present', function() {
            expect(element(by.model('form.booleanSearchModel.rows[rowIndex].strength')).$('option:checked').getText()).toEqual('present');
          });

          it('default value of "From" should be TS17', function() {
            expect(element(by.model('form.booleanSearchModel.rows[rowIndex].stageFrom')).$('option:checked').getText()).toEqual('TS17');

          });

          it('default value of "To" should be TS28', function() {
            expect(element(by.model('form.booleanSearchModel.rows[rowIndex].stageTo')).$('option:checked').getText()).toEqual('TS28');
          });

          it('2 actions button should be visible Row last column', function() {
            column =  deriva.booleanSearchPage.getFirstRowColumnValues(8);
            column.all(by.css('button')).then(function(buttons) {
              expect(buttons.length).toEqual(2, '2 buttons are not visible.');
              expect(buttons[0].element(by.css('span')).getAttribute("class")).toEqual('glyphicon glyphicon-remove', 'Remove button icon is not correct.');
              expect(buttons[1].element(by.css('span')).getAttribute("class")).toEqual('glyphicon glyphicon-trash', 'Trash button icon is not correct.');
              expect(buttons[1].getAttribute("disabled")).toEqual('true', 'the button is not disabled.');
            });
          });
      });
  });
};
