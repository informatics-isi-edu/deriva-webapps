var deriva = require('../../utils/common/deriva-webapps');
var httpFun = require('../../utils/common/httpFun.js');
var testConfig = require('../../config');
var expectedValue = require('./dynamic-treeview-expected-value.js');

exports.tests = function (appName, baseUrl) {

  describe('Dynamic page '+ appName, function () {

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
                     expect(
                       res.statusCode).toEqual(200, url + " is not a valid image source.");
                     done();
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

        describe('Actions for the page', function() {

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
            });
          });
        });

        describe('Treeview', function() {

          it('it is displayed with no errors', function() {
            expect(element(by.id('jstree')).isDisplayed()).toBeTruthy('Treeview is not visible.');
            expect(element(by.id('error-message')).isDisplayed()).toBe(false);
          });

          it('it should auto scroll to the first annoted term of the tree  (nerve of detrusor muscle of bladder)', function() {
            var ele = element(by.id('nid_1431'));
            expect(deriva.elementInViewport(ele)).toBeTruthy('first annoted term of the tree is not visible.');
          });
        });
    });
  });
};
