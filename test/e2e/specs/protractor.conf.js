exports.config = {
  framework: 'jasmine2',
  capabilities: {

    browserName: 'chrome',
    'chromeOptions': {
      args: ['--lang=en',
        '--window-size=2480,1920'
      ]
    }
  },
  specs: [
    '*/*.spec.js'
  ],
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    print: function() {}
  },
  params: {
    defaultTimeout: 75000,
    exeEnv: ' ',
    derivaWebappUtilUrl: "../../utils/derivaWebapps.js",   //modify config.js to change default Location
  },
  onPrepare: function() {
    let SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: 'all'
    }));
  }
}
