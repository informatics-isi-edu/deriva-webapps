exports.heatmap = function(appName, baseUrl) {
    var testConfig = require('../../config');
    var expectedValue = require('./heatmap-expected-value');

    /**
     * [General]
     * View Array Data Table link is visible at the top of the page
     * hovering over link shows the tooltip with content View Array Data related to this Gene
     * 4 heatmaps are visible
     */
    describe(appName + ' general test cases for heatmap page', function(){
        var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
            EC = protractor.ExpectedConditions,
            spinnerElem,
            viewArrLinkElem,
            viewArrLinkTooltipElem,
            heatmapsElem;

        beforeAll(function(){
            // Elements
            spinnerElem = element(by.id('heatmapSpinner'));
            viewArrLinkElem = element(by.className('viewMore')).element(by.tagName('a'));
            viewArrLinkTooltipElem = element(by.css('.tooltip-inner'));
            heatmapsElem = element.all(by.repeater('heatmap in heatmaps'));
            browser.ignoreSynchronization = true;
            browser.get(heatmapUrl);
            browser.wait(EC.invisibilityOf(spinnerElem), browser.params.defaultTimeout);
        });


        it('View Array Data Table link is visible at the top of the page', function(){
            viewArrLinkElem.getText().then(function(text){
                expect(text).toBe(expectedValue.arrayDataTableLinkTitle);
            });
        });

        it('hovering over link shows the tooltip with content "View Array Data related to this Gene"', function(){
            browser.actions()
                .mouseMove(viewArrLinkElem)
                .perform();

            browser.wait(EC.visibilityOf(viewArrLinkTooltipElem), browser.params.defaultTimeout);
            viewArrLinkTooltipElem.getText().then(function(text){
                expect(text).toBe(expectedValue.arrayDataTableLinkHoverTooltip);
            });
        });

        it('4 heatmaps are visible', function(){
            heatmapsElem.count().then(function(cnt){
                expect(cnt).toBe(4);
            });
        });
    });

    /**
     * [Heatmaps]
     * check each heatmap's title, legend, legend values and number of bar sections
     */
    for(var heatmapID in expectedValue.NCBIGeneID17740){
        (function(heatmapID){
            describe(appName + ' heatmap id : ' + heatmapID, function(){
                var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
                    EC = protractor.ExpectedConditions,
                    spinnerElem,
                    heatmapElem,
                    heatmapsElem;
        
                beforeAll(function(){
                    // Elements
                    spinnerElem = element(by.id('heatmapSpinner'));
                    heatmapsElem = element.all(by.repeater('heatmap in heatmaps'));
                    browser.ignoreSynchronization = true;
                    browser.get(heatmapUrl);
                    browser.wait(EC.invisibilityOf(spinnerElem), browser.params.defaultTimeout);
                    
                    heatmapElem = heatmapsElem.filter(function(elem, index){
                        return elem.element(by.tagName("heatmap")).getAttribute("heatmap-id").then(function(id){
                            return id == heatmapID;
                        })
                    });
                });
                
                it('title should be "'+expectedValue.NCBIGeneID17740[heatmapID].title+'"', function(){
                    heatmapElem
                    .first()
                    .element(by.css('.infolayer .g-gtitle'))
                    .getText()
                    .then(function(text){
                        expect(text).toBe(expectedValue.NCBIGeneID17740[heatmapID].title);
                    });
                });
        
                it('legend should be visible', function(){
                    heatmapElem
                    .first(function(elem){
                        expect(elem.element(by.css('.infolayer .colorbar')).isPresent()).toBeTruthy();
                    });
                });
        
                it('legend should have values: ' + expectedValue.NCBIGeneID17740[heatmapID].legendValues, function(){
                    heatmapElem
                    .first()
                    .all(by.css(".infolayer .crisp text"))
                    .getText()
                    .then(function(textArr){
                        var legendValues = []
                        for( var i = 0; i < textArr.length; i++){
                            value = parseFloat(textArr[i]);
                            legendValues.push(value);
                        }
                        return legendValues;
                    })
                    .then(function(legendValues){
                        expectedValue.NCBIGeneID17740[heatmapID].legendValues.forEach(function(value){
                            expect(legendValues).toContain(value, value + " value does not exist in the legend");
                        })
                    })
                });
        
                it('heatmap bar should have '+expectedValue.NCBIGeneID17740[heatmapID].barSections+' sections', function(){
                    heatmapElem
                    .first()
                    .element(by.css('.subplot.xy .xaxislayer-above'))
                    .all(by.css('.xtick.ticks.crisp'))
                    .count().then(function(cnt){
                        expect(cnt).toBe(expectedValue.NCBIGeneID17740[heatmapID].barSections)
                    })
                })
            })
        }(heatmapID));
    }
}

