var treeviewConfig = {
    nodeClickCallback:{
        booleanSearch: function(node) {
            var sourceObject = '{ "id": "' + node.dbxref + '", "name": "' + node.base_text + '" }';
            return 'parent.setSourceForFilter(' + sourceObject + ');';
        }
    }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = treeviewConfig;
}
