var baseUri = '/ermrest/catalog/1/attributegroup/M:=isa:dataset/isa:dataset_species/vocab:species/name=Mus%20musculus/$M/isa:dataset_anatomy/Y:=vocab:anatomy/$M/isa:dataset_stage/X:=vocab:stage/sort_key::geq::0/sort_key::lt::10000/$M/isa:dataset_experiment_type/Z:=vocab:experiment_type';

var matrixConfigs = {
  '*': {
    xURL: baseUri + '/sort_key:=X:sort_key,id:=X:id,title:=X:name@sort(sort_key)',
    yURL: baseUri + '/id:=Y:id,title:=Y:name@sort(title)',
    zURL: baseUri + '/id:=Z:id,title:=Z:name@sort(title)',
    xysURL: baseUri + '/xid:=X:id,yid:=Y:id;zid:=array(Z:name)',
    xFacetColumn: 'id',
    yFacetColumn: 'id',
    zFacetColumn: 'id',
    styles: {
      title: 'Mouse Data Summary',
      maxCols: 30,
      maxRows: 100,
      cellWidth: 25,
      cellHeight: 25,
      rowHeaderWidth: 300,
      colHeaderHeight: 50,
      legendHeight: 170,
      legendBarWidth: 55,
    },
  },
};
