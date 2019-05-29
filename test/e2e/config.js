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
                break;
            case 'staging':
                return baseUrlArrStaging;
                break;
            default:
                return baseUrlArr;
                break;
        }
    }

    // individual pages
    this.geneExpression = {
        'heatmapNCBIGeneID17740' : '/heatmap/#2/Gene_Expression:Array_Data_view/NCBI_GeneID=17740'
    }
    
    
}

module.exports = new testConfig();