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
     * [first heatmap]
     * title should be `Developing Pelvic Ganglia FACS (ST1)
     * legend should be visible
     * legend should have values: `9.5`, `10`, `10.5`
     * heatmap bar should have 15 sections
     */

    describe(appName + ' first heatmap', function(){
        var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
            EC = protractor.ExpectedConditions,
            spinnerElem,
            heatmapElem,
            heatmapsElem,
            heatmapID = Object.keys(expectedValue.NCBIGeneID17740)[0];

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
        
        it('title should be "Developing Pelvic Ganglia FACS (ST1)"', function(){
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

        it('legend should have values: `9.5`, `10`, `10.5`', function(){
            heatmapElem
            .first()
            .all(by.css(".infolayer .crisp text"))
            .getText()
            .then(function(textArr){
                var legendValues = []
                for( var i = 0; i < textArr.length; i++){
                (function(index){
                        value = parseFloat(textArr[i]);
                        legendValues.push(value);
                }(i)) 
                }
                return legendValues;
            })
            .then(function(legendValues){
                expectedValue.NCBIGeneID17740[heatmapID].legendValues.forEach(function(value){
                    expect(legendValues).toContain(value, value + " value does not exist in the legend");
                })
            })
        });

        it('heatmap bar should have 15 sections', function(){
            heatmapElem
            .first()
            .element(by.css('.subplot.xy .xaxislayer-above'))
            .all(by.css('.xtick.ticks.crisp'))
            .count().then(function(cnt){
                expect(cnt).toBe(expectedValue.NCBIGeneID17740[heatmapID].barSections)
            })
        })
    })


    /**
     * [second heatmap]
     * title should be 'JGA Single Cell (ST1)'
     * legend should be visible
     * legend should have values: `6`, `8`, `10`
     * heatmap bar should have 12 sections
     */

    describe(appName + ' second heatmap', function(){
        var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
            EC = protractor.ExpectedConditions,
            spinnerElem,
            heatmapElem,
            heatmapsElem,
            heatmapID = Object.keys(expectedValue.NCBIGeneID17740)[1];

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
        
        it('title should be "JGA Single Cell (ST1)"', function(){
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

        it('legend should have values: `6`, `8`, `10`', function(){
            heatmapElem
            .first()
            .all(by.css(".infolayer .crisp text"))
            .getText()
            .then(function(textArr){
                var legendValues = []
                for( var i = 0; i < textArr.length; i++){
                (function(index){
                        value = parseFloat(textArr[i]);
                        legendValues.push(value);
                }(i)) 
                }
                return legendValues;
            })
            .then(function(legendValues){
                expectedValue.NCBIGeneID17740[heatmapID].legendValues.forEach(function(value){
                    expect(legendValues).toContain(value, value + " value does not exist in the legend");
                })
            })
        });

        it('heatmap bar should have 12 sections', function(){
            heatmapElem
            .first()
            .element(by.css('.subplot.xy .xaxislayer-above'))
            .all(by.css('.xtick.ticks.crisp'))
            .count().then(function(cnt){
                expect(cnt).toBe(expectedValue.NCBIGeneID17740[heatmapID].barSections)
            })
        })
    })

    /**
     * [third heatmap]
     * title should be 'Developing Kidney (ST1)'
     * legend should be visible
     * legend should have values: `6`, `8`, `10`, `12`
     * heatmap bar should have 64 sections
     */
    describe(appName + ' third heatmap', function(){
        var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
            EC = protractor.ExpectedConditions,
            spinnerElem,
            heatmapElem,
            heatmapsElem,
            heatmapID = Object.keys(expectedValue.NCBIGeneID17740)[2];

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
        
        it('title should be "Developing Kidney (ST1)"', function(){
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

        it('legend should have values: `6`, `8`, `10`, `12`', function(){
            heatmapElem
            .first()
            .all(by.css(".infolayer .crisp text"))
            .getText()
            .then(function(textArr){
                var legendValues = []
                for( var i = 0; i < textArr.length; i++){
                (function(index){
                        value = parseFloat(textArr[i]);
                        legendValues.push(value);
                }(i)) 
                }
                return legendValues;
            })
            .then(function(legendValues){
                expectedValue.NCBIGeneID17740[heatmapID].legendValues.forEach(function(value){
                    expect(legendValues).toContain(value, value + " value does not exist in the legend");
                })
            })
        });

        it('heatmap bar should have 64 sections', function(){
            heatmapElem
            .first()
            .element(by.css('.subplot.xy .xaxislayer-above'))
            .all(by.css('.xtick.ticks.crisp'))
            .count().then(function(cnt){
                expect(cnt).toBe(expectedValue.NCBIGeneID17740[heatmapID].barSections)
            })
        })
    })


    /**
     * [fourth heatmap]
     * title should be 'Developing Gonadal FACS (ST1)'
     * legend should be visible
     * legend should have values: `8.5`, `9`, `9.5`, `10`, `10.5`
     * heatmap bar should have 90 sections
     */
    describe(appName + ' fourth heatmap', function(){
        var heatmapUrl = baseUrl + testConfig.geneExpression.heatmapNCBIGeneID17740,
            EC = protractor.ExpectedConditions,
            spinnerElem,
            heatmapElem,
            heatmapsElem,
            heatmapID = Object.keys(expectedValue.NCBIGeneID17740)[3];

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
        
        it('title should be "Developing Gonadal FACS (ST1)"', function(){
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

        it('legend should have values: `8.5`, `9`, `9.5`, `10`, `10.5`', function(){
            heatmapElem
            .first()
            .all(by.css(".infolayer .crisp text"))
            .getText()
            .then(function(textArr){
                var legendValues = []
                for( var i = 0; i < textArr.length; i++){
                (function(index){
                        value = parseFloat(textArr[i]);
                        legendValues.push(value);
                }(i)) 
                }
                return legendValues;
            })
            .then(function(legendValues){
                expectedValue.NCBIGeneID17740[heatmapID].legendValues.forEach(function(value){
                    expect(legendValues).toContain(value, value + " value does not exist in the legend");
                })
            });
        });

        it('heatmap bar should have 90 sections', function(){
            heatmapElem
            .first()
            .element(by.css('.subplot.xy .xaxislayer-above'))
            .all(by.css('.xtick.ticks.crisp'))
            .count().then(function(cnt){
                expect(cnt).toBe(expectedValue.NCBIGeneID17740[heatmapID].barSections)
            });
        })
    })
}

