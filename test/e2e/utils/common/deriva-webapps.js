var booleanSearchPage = function() {
    var that = this;

    this.getPageTitle = function() {
        return browser.executeScript("return $('#page-title').text();");
    };

    this.getPageTitleElement = function() {
        return element(by.id('page-title'));
    };

    this.getSidePanelFiddler = function() {
        return element(by.className('sidePanFiddler')).element(by.className('facet-glyph-icon'));
    }

    this.getSidePanel = function() {
      return element(by.css('.resizable-panel'));
    }

    this.getSubmitButton = function () {
        return element(by.id("submit-button"));
    };

    this.getColumnNames = function() {
        return element.all(by.css(".table tr:nth-child(1) > td"));
    };

    this.getNavBarLinks = function() {
        return element.all(by.css("#navbar-menu > li > a"));
    };

    this.getFirstRow = function () {
        return element(by.css(".table tr:nth-child(2)"));
    };

    this.getFirstRowColumnValues = function (idx) {
        return element.all(by.css(".table tr:nth-child(2)" + " td:nth-child("+idx+")"));
    };

};

function derivaWebapps() {
    this.booleanSearchPage = new booleanSearchPage();

    this.waitForElement = function (locator, timeout) {
        return browser.wait(protractor.ExpectedConditions.visibilityOf(locator), timeout || browser.params.defaultTimeout);
    };

    this.waitForElementInverse = function (locator, timeout) {
        return browser.wait(protractor.ExpectedConditions.invisibilityOf(locator), timeout || browser.params.defaultTimeout);
    };
};

module.exports = new derivaWebapps();
