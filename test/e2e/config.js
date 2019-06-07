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

    // individual pages
    this.geneExpression = {
        'heatmapNCBIGeneID17740' : '/heatmap/#2/Gene_Expression:Array_Data_view/NCBI_GeneID=17740'
    }

    this.treeviewPage = {
        'dynamic'   : '/?Specimen_RID=N-GXNY',
        'recordpage': '/chaise/record/#2/Gene_Expression:Specimen/RID=N-GXNY'
    }
}

module.exports = new testConfig();
