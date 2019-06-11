var deriva = require('../../utils/common/deriva-webapps');
var httpFun = require('../../utils/common/httpFun.js');
var testConfig = require('../../config');
var expectedValue = require('./dynamic-treeview-expected-value.js');

exports.tests = function (appName, baseUrl) {

  describe('Dynamic page '+ appName, function () {
    var EC = protractor.ExpectedConditions;
    beforeAll(function () {
      browser.ignoreSynchronization=true;
      browser.get(baseUrl+ testConfig.treeviewPage.dynamic);
      ele = element(by.id('rt-heading-Specimen&nbsp;Expression'));

      deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));

    });

    describe('legend panel', function () {
      beforeAll(function () {
        facet1 = deriva.treeviewPage.getListElements('facets-1');
        facet2 = deriva.treeviewPage.getListElements('facets-2');
        facet3 = deriva.treeviewPage.getListElements('facets-3');
        facet4 = deriva.treeviewPage.getListElements('facets-4');
        facet5 = element(by.css('#look-up > div > div:nth-child(5)'));

      });

      describe('strength section :', () => {

        it('it should contain 6 options', function() {
          facet1.count().then(function (count) {
            expect(count).toEqual(6);
          });
        });

        it('each list item should  have correct name', function() {
          var facet1LinkNames = expectedValue.strength.names
          facet1.all(by.css('span')).then(function (linkArr) {
            linkArr.forEach(function (link) {
              link.getText().then(function(text) {
                 expect(facet1LinkNames).toContain(text);
               });
             });
          }).catch(function(err) {
            console.log(err);
          });
        });

        it('each list item should  have correct image link', function(done) {
          var facet1ImgLinks = expectedValue.strength.imgs;
          imgFullLinks = facet1ImgLinks.map(function (ele) {
            return baseUrl + ele;
          });

          facet1.all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
            linkArr.forEach(function (url) {
               expect(imgFullLinks).toContain(url);
               httpFun.httpGet(url).then(function (res) {
                 expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                 done();
               }).catch(function (err) {
                 console.log(err);
                 done.fail();
               });
             });
          });
        });
      });

      describe('pattern section :', () => {

        it('it should contain 7 options', function() {
          facet2.count().then(function (count) {
            expect(count).toEqual(7);
          });
        });

        it('each list item should  have correct name', function() {
          var facet2LinkNames = expectedValue.pattern.names;
          facet2.all(by.css('span')).then(function (linkArr) {
            linkArr.forEach(function (link) {
              link.getText().then(function(text) {
                 expect(facet2LinkNames).toContain(text);
               });
             });
          }).catch(function(err) {
            console.log(err);
          });
        });

        it('each list item should  have correct image link', function(done) {
          var facet2ImgLinks = expectedValue.pattern.imgs;
          imgFullLinks = facet2ImgLinks.map(function (ele) {
            return baseUrl + ele;
          });

          facet2.all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
            linkArr.forEach(function (url) {
               expect(imgFullLinks).toContain(url);
               httpFun.httpGet(url).then(function (res) {
                 expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                 done();
               }).catch(function (err) {
                 console.log(err);
                 done.fail();
               });
             });
          });
        });
      });

      describe('density section :', () => {

        it('it should contain 3 options', function() {
          facet3.count().then(function (count) {
            expect(count).toEqual(3);
          });
        });

        it('each list item should  have correct name', function() {
          var facet3LinkNames = expectedValue.density.names;
          facet3.all(by.css('span')).then(function (linkArr) {
            linkArr.forEach(function (link) {
              link.getText().then(function(text) {
                 expect(facet3LinkNames).toContain(text);
               });
             });
          }).catch(function(err) {
            console.log(err);
          });
        });

        it('each list item should  have correct image link', function(done) {
          var facet3ImgLinks = expectedValue.density.imgs;
          imgFullLinks = facet3ImgLinks.map(function (ele) {
            return baseUrl + ele;
          });

          facet3.all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
            linkArr.forEach(function (url) {
               expect(imgFullLinks).toContain(url);
               httpFun.httpGet(url).then(function (res) {
                 expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                 done();
               }).catch(function (err) {
                 console.log(err);
                 done.fail();
               });
             });
          });
        });
      });

      describe('density change section :', () => {

        it('it should contain 4 options', function() {
          facet4.count().then(function (count) {
            expect(count).toEqual(4);
          });
        });

        it('each list item should  have correct name', function() {
          var facet4LinkNames = expectedValue.densityChange.names;
          facet4.all(by.css('span')).then(function (linkArr) {
            linkArr.forEach(function (link) {
              link.getText().then(function(text) {
                 expect(facet4LinkNames).toContain(text);
               });
             });
          }).catch(function(err) {
            console.log(err);
          });
        });

        it('each list item should  have correct image link', function(done) {
          var facet4ImgLinks = expectedValue.densityChange.imgs;
          imgFullLinks = facet4ImgLinks.map(function (ele) {
            return baseUrl + ele;
          });

          facet4.all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
            linkArr.forEach(function (url) {
               expect(imgFullLinks).toContain(url);
               httpFun.httpGet(url).then(function (res) {
                 expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                 done();
               }).catch(function (err) {
                 console.log(err);
                 done.fail();
               });
             });
          });
        });
      });

      describe('contains note section :', () => {

        it('it should contain correct text options', function() {
          facet5.all(by.css('span')).then(function (arr) {
            arr.forEach(function (ele) {
              ele.getText().then(function(text) {
                 expect(text).toEqual('Contains note', 'Contains Note text is not correct');
               });
             });
          }).catch(function(err) {
            console.log(err);
          });
        });

        it('it should have correct image link', function(done) {
          var facet5ImgLinks = expectedValue.containsNote.imgs;
          imgFullLinks = facet5ImgLinks.map(function (ele) {
            return baseUrl + ele;
          });

          facet5.all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
            linkArr.forEach(function (url) {
               expect(imgFullLinks).toContain(url);
               httpFun.httpGet(url).then(function (res) {
                 expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                 done();
               }).catch(function (err) {
                 console.log(err);
                 done.fail();
               });
             });
          });
        });
      });
    });

    describe('main tree', function () {

        beforeAll(function() {
            pageTitle = element(by.id('anatomyHeading'));
            searchDiv = element(by.id('searchDiv'));
            actionBtn = element(by.id('expandCollapse'));

        });

        it('title should not be visible', function() {
            expect(pageTitle.isDisplayed()).toBe(false, 'Page title is displayed');
        });

        it('it is displayed with no errors', function() {
          expect(element(by.id('jstree')).isDisplayed()).toBeTruthy('Treeview is not visible.');
          expect(element(by.id('error-message')).isDisplayed()).toBe(false);
        });

        it('it should auto scroll to the first annoted term of the tree  (nerve of detrusor muscle of bladder)', function() {
          var ele = element(by.id('nid_1431'));
          expect(deriva.elementInViewport(ele)).toBeTruthy('first annoted term of the tree is not visible.');
        });


        describe('actions for the page', function() {
          beforeAll(function() {
            searchInput = element(by.id('plugins4_q'));
          });

          it('dropdown value should be TS26: 18 dpc by default', function() {
            expect(element(by.id('number-button')).getText()).toEqual('TS26: 18 dpc');
          });

          it('input is  visible', function(){
            expect(searchDiv.isDisplayed()).toBeTruthy("Search box input is not visible when page loads initially.");
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

          it('search `nerve of detrusor muscle of bladder` takes the scroll to it and is in italics and highlighted', function() {
            searchInput.clear();
            searchInput.sendKeys('nerve of detrusor muscle of bladder');
            var ele = element.all(by.css('.jstree-node .jstree-search')).get(0);
            browser.wait(EC.presenceOf(ele), browser.params.defaultTimeout);

            expect(ele.getCssValue('background-color')).toBe('rgba(239, 239, 166, 1)');
            expect(ele.getCssValue('font-style')).toBe('italic');
            expect(element.all(by.css('.jstree-node .jstree-search span.annotated.display-text')).get(0).getCssValue('font-weight')).toBe('700');
          });

          it('collapsing the parent should retain the highlighted searched item', function() {
            var ele = element.all(by.css('.jstree-node .jstree-search')).get(0);

            element(by.css('#nid_3476 > i')).click();
            browser.wait(EC.invisibilityOf(ele), browser.params.defaultTimeout);

            element(by.css('#nid_3476 > i')).click();

            browser.wait(EC.presenceOf(ele), browser.params.defaultTimeout);
            expect(deriva.elementInViewport(ele)).toBeTruthy('searched node of the tree is not visible.');
            expect(element.all(by.css('.jstree-node .jstree-search')).get(0).getCssValue('background-color')).toBe('rgba(239, 239, 166, 1)');
            expect(element.all(by.css('.jstree-node .jstree-search')).get(0).getCssValue('font-style')).toBe('italic');
            expect(element.all(by.css('.jstree-node .jstree-search span.annotated.display-text')).get(0).getCssValue('font-weight')).toBe('700');
          });

          xit('all node list collapse on `Collapse All` click - no small dataset available', function(done) {
            // actionBtn.all(by.css('button')).then(function(buttons) {
            //   buttons[1].click().then(function() {
            //     expect(element(by.id('jstree')).all(by.css('.jstree-open')).count()).toBe(0);
            //     done();
            //   });
            // }).catch(function(err) {
            //   console.log(err);
            // });
          });

          xit('all node list expand on `Expand All` click - no small dataset available', function(done) {
            // actionBtn.all(by.css('button')).then(function(buttons) {
            //   buttons[0].click().then(function() {
            //     expect(element(by.id('jstree')).all(by.css('.jstree-open')).count()).toBe(4);
            //     done();
            //   });
            // }).catch(function(err) {
            //   console.log(err);
            // });
          });

        });

        describe('treeview', function() {

          describe('hierarchy', function() {
            beforeAll(function() {
              btn = element(by.css('#nid_1434 > i'));
              imgLink = element(by.css('#nid_2424_anchor > span > span.schematic-popup-icon > img'));
            });

            it('node list expanded on + click', function() {
              btn.click();
              browser.wait(EC.visibilityOf(element(by.css('#nid_1434 > ul'))), browser.params.defaultTimeout);
              element(by.css('#nid_1434')).all(by.tagName('li')).each(function (elm) {
                expect((elm).isDisplayed()).toBeTruthy('Expanded List list is not visible.');
              });
            });

            it('should open the image popup modal on click of image icon', function(done) {
                browser.wait(EC.elementToBeClickable(imgLink), browser.params.defaultTimeout);
                imgLink.click().then(function() {
                    var modalContent = element(by.css('.modal-content'));
                    deriva.waitForElement(modalContent);
                    expect(modalContent.isDisplayed()).toBeTruthy();
                    done();
                }).catch(function (err) {
                    done.fail();
                    console.log(err);
                });
            });

            it('should close the image popup modal on click of X on the modal window', function(done) {
                 var closeBtn = element(by.css('#schematic-modal > div > div > div.modal-header > button'));
                 var modalContent = element(by.id('schematic-modal'));
                 browser.wait(EC.elementToBeClickable(closeBtn), browser.params.defaultTimeout);
                 closeBtn.click().then(function(){
                    deriva.waitForElementInverse(modalContent);
                    expect(modalContent.isDisplayed()).toEqual(false);
                    done();
                }).catch(function (err) {
                    console.log(err);
                    done.fail();
                });
            });

            it('should contain annotations', function(done) {
                 var annotationsImgLink = expectedValue.annotations.imgs;
                 imgFullLinks = annotationsImgLink.map(function (ele) {
                   return baseUrl + ele;
                 });

                 element(by.id('nid_1431')).all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
                   linkArr.forEach(function (url) {
                      expect(imgFullLinks).toContain(url);
                      httpFun.httpGet(url).then(function (res) {
                        expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                        done();
                      }).catch(function (err) {
                        console.log(err);
                        done.fail();
                      });
                    });
                 });
            });
            it('density Note should have correct tooltip', function() {
                var densityNote = element(by.css('#nid_1431_anchor > span > span:nth-child(3) > img:nth-child(4)'));
                densityNote.click();
                var tooltip = element(by.css('.tooltip-inner'));
                browser.wait(EC.presenceOf(tooltip), browser.params.defaultTimeout);

                expect(tooltip.isDisplayed()).toBeTruthy();
                densityNote.click();
                browser.wait(EC.invisibilityOf(tooltip), browser.params.defaultTimeout);

              });

            it('note should have correct tooltip', function() {
                var note = element(by.css('#nid_1431_anchor > span > span:nth-child(3) > img:nth-child(5)'));
                note.click();
                var tooltip = element(by.css('.tooltip-inner'));
                browser.wait(EC.presenceOf(tooltip), browser.params.defaultTimeout);

                expect(tooltip.isDisplayed()).toBeTruthy();
                note.click();
                browser.wait(EC.invisibilityOf(tooltip), browser.params.defaultTimeout);

              });

            it('node list collapse on - click', function() {
              btn.click();
              expandedList = element(by.css('#nid_1434 > ul'));
              browser.wait(EC.invisibilityOf(expandedList), browser.params.defaultTimeout);
              expect((expandedList).isPresent()).toBeFalsy();
            });

            describe('on reopeing of node list', function() {
              it('should expanded on + click', function() {
                btn.click();
                browser.wait(EC.visibilityOf(element(by.css('#nid_1434 > ul'))), browser.params.defaultTimeout);
                element(by.css('#nid_1434')).all(by.tagName('li')).each(function (elm) {
                  expect((elm).isDisplayed()).toBeTruthy('Expanded List list is not visible.');
                });
              });

              it('should open the image popup modal on click of image icon', function(done) {
                  browser.wait(EC.elementToBeClickable(imgLink), browser.params.defaultTimeout);
                  imgLink.click().then(function() {
                      var modalContent = element(by.css('.modal-content'));
                      deriva.waitForElement(modalContent);
                      expect(modalContent.isDisplayed()).toBeTruthy();
                      done();
                  }).catch(function (err) {
                      done.fail();
                      console.log(err);
                  });
              });

              it('should close the image popup modal on click of X on the modal window', function(done) {
                   var closeBtn = element(by.css('#schematic-modal > div > div > div.modal-header > button'));
                   var modalContent = element(by.id('schematic-modal'));
                   browser.wait(EC.elementToBeClickable(closeBtn), browser.params.defaultTimeout);
                   closeBtn.click().then(function(){
                      deriva.waitForElementInverse(modalContent);
                      expect(modalContent.isDisplayed()).toEqual(false);
                      done();
                  }).catch(function (err) {
                      console.log(err);
                      done.fail();
                  });
              });

              it('should contain annotations', function(done) {
                   var annotationsImgLink = expectedValue.annotations.imgs;
                   imgFullLinks = annotationsImgLink.map(function (ele) {
                     return baseUrl + ele;
                   });

                   element(by.id('nid_1431')).all(by.tagName('img')).getAttribute('src').then(function (linkArr) {
                     linkArr.forEach(function (url) {
                        expect(imgFullLinks).toContain(url);
                        httpFun.httpGet(url).then(function (res) {
                          expect(res.statusCode).toEqual(200, url + " is not a valid image source.");
                          done();
                        }).catch(function (err) {
                          console.log(err);
                          done.fail();
                        });
                      });
                   });
              });
              it('density Note should have correct tooltip', function() {
                  var densityNote = element(by.css('#nid_1431_anchor > span > span:nth-child(3) > img:nth-child(4)'));
                  densityNote.click();
                  var tooltip = element(by.css('.tooltip-inner'));
                  browser.wait(EC.presenceOf(tooltip), browser.params.defaultTimeout);
                  expect(tooltip.isDisplayed()).toBeTruthy();
                  densityNote.click();

                  browser.wait(EC.invisibilityOf(tooltip), browser.params.defaultTimeout);

                });

              it('note should have correct tooltip', function() {
                  var note = element(by.css('#nid_1431_anchor > span > span:nth-child(3) > img:nth-child(5)'));
                  note.click();
                  var tooltip = element(by.css('.tooltip-inner'));
                  browser.wait(EC.presenceOf(tooltip), browser.params.defaultTimeout);

                  expect(tooltip.isDisplayed()).toBeTruthy();
                  note.click();
                  browser.wait(EC.invisibilityOf(tooltip), browser.params.defaultTimeout);

                });

              it('node list collapse on - click', function() {
                btn.click();
                expandedList = element(by.css('#nid_1434 > ul'));
                browser.wait(EC.invisibilityOf(expandedList), browser.params.defaultTimeout);
                expect((expandedList).isPresent()).toBeFalsy();
              });

            })
          });
        });
      });

    describe('error/warning messages', function () {

        describe('error message for specimen not a mouse', function() {
          beforeAll(function() {
            browser.get(baseUrl+ testConfig.treeviewPage.dynamicError1);
            ele = element(by.id('alert-error-text'));

            deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
          });

          it('shows correct error message', function() {
            expect(ele.getText()).toMatch('Only specimens of species \'Mus musculus\' are supported.\\s+Specimen RID: Q-2964, Species: Homo sapiens');
          });
        });

        describe('error message for specimen does not exist', function() {
          beforeAll(function() {
            browser.get(baseUrl+ testConfig.treeviewPage.dynamicError2);
            ele = element(by.id('alert-error-text'));

            deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
          });

          it('shows correct error message', function() {
            expect(ele.getText()).toEqual("There is no specimen with Specimen RID: N-GX");
          });
        });

        describe('error message for specimen has no annotated terms', function() {
          beforeAll(function() {
            browser.get(baseUrl+ testConfig.treeviewPage.dynamicError3);
            ele = element(by.id('alert-error-text'));

            deriva.waitForElementInverse(element.all(by.id("loadIcon")).get(0));
          });

          it('shows correct error message', function() {
            expect(ele.getText()).toEqual('There is no specimen with Specimen RID: 1G-4DY4');
          });
        });

    });
  });
};
