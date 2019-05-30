function testConfig() {

    var baseUrlArr = [
        {
            'app' : 'deriva-webapps',
            'url' : 'https://www.rebuildingakidney.org/deriva-webapps' 
        }
    ];

    var baseUrlArrDev = [
        {
            'app' : 'deriva-webapps',
            'url' : 'https://dev.rebuildingakidney.org/deriva-webapps' 
        }
    ];

    var baseUrlArrStaging = [
        {
            'app' : 'deriva-webapps',
            'url' : 'https://staging.rebuildingakidney.org/deriva-webapps' 
        }
    ];

    this.getEnvUrl = function(env) {
        switch(env){
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