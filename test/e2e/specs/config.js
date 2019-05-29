function testConfig() {

  var baseUrlArr = [{
      'app': 'Boolean Search',
      'url': 'https://www.rebuildingakidney.org/deriva-webapps/boolean-search/'
    }
  ];
  var baseUrlArrDev = [{
      'app': 'Boolean Search',
      'url': 'https://dev.rebuildingakidney.org/deriva-webapps/boolean-search/'
    }
  ];
  var baseUrlArrStaging = [{
      'app': 'Boolean Search',
      'url': 'https://staging.rebuildingakidney.org/deriva-webapps/boolean-search/'
    }
  ];

  this.getEnvUrl = function(env) {
    switch (env) {
      case 'dev':
        return baseUrlArrDev;
      case 'staging':
        return baseUrlArrStaging;
      default:
        return baseUrlArr;
    }
  }
}
module.exports = new testConfig();
