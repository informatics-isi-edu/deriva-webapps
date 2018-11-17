var heatmapConfig = {
    data:{
        titleColumn: "Section",
        idColumn: "ID",
        xColumn: "Label",
        yColumn: "Probe_Set_Name",
        zColumn: "Value",
        sortBy:[
            {"column": "Section_Ordinal", "descending": false},
			{"column": "Probe_Set_Name", "descending": false},
			{"column": "Ordinal", "descending": false}
        ]
    },
    presentation:{
        width: 1200,
        xTickAngle: 90,
        tickFontFamily: "Lucida Console",
        tickFontSize: 12
    }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = heatmapConfig;
}
