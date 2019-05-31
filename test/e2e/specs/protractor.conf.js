let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    framework : 'jasmine',
    seleniumAddress : 'http://localhost:4444/wd/hub',
    specs : ['*.spec.js'],
    capabilities : {
        browserName : 'chrome'
    },
    jasmineNodeOpts : {
        showColor : true,
        defaultTimeoutInterval: 120000
    },
    params : {
        defaultTimeout : 75000,
        exeEnv : ' ',
        app : ' '
    },
    onPrepare: function(){
        jasmine.getEnv().addReporter(new SpecReporter({
            displayFailuresSummary: true,
            displayFailuredSpec: true,
            displaySuiteNumber: true,
            displaySpecDuration: true
        }));
    }
}