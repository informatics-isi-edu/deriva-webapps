/**
 * Please Note
 * This is a sample configuration file.
 * 
 * mimics the vitessce component on this page:
 * https://portal.hubmapconsortium.org/browse/dataset/f47349f1e0fea69263a8d68c7dac65c5
 */
var vitessceConfig = {
  version: '1.0.15',
  name: 'f47349f1e0fea69263a8d68c7dac65c5',
  description: 'HBM842.SQSV.255 from hubmap consortium',
  datasets: [
    {
      uid: 'A',
      name: 'f47349f1e0fea69263a8d68c7dac65c5',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://assets.hubmapconsortium.org/f47349f1e0fea69263a8d68c7dac65c5/hubmap_ui/anndata-zarr/secondary_analysis.zarr',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
            embeddingType: 'UMAP'
          },
          options: {
            // Should point to the observation-by-feature matrix
            obsFeatureMatrix: {
              path: 'X',
              initialFeatureFilterPath: 'var/marker_genes_for_heatmap',
            },
            obsSets: [
              {
                path: 'obs/leiden',
                name: 'Leiden'
              }
            ],
            obsEmbedding: {
              path: 'obsm/X_umap',
              dims: [0, 1],
              name: 'UMAP',
            },
            featureLabels: {
              path: 'var/hugo_symbol'
            },
            obsLabels: [
              {
                path: 'obs/marker_gene_0',
                name: 'Marker Gene 0',
                obsLabelsType: 'Marker Gene 0'
              }, {
                path: 'obs/marker_gene_1',
                name: 'Marker Gene 1',
                obsLabelsType: 'Marker Gene 1'
              }, {
                path: 'obs/marker_gene_2',
                name: 'Marker Gene 2',
                obsLabelsType: 'Marker Gene 2'
              }, {
                path: 'obs/marker_gene_3',
                name: 'Marker Gene 3',
                obsLabelsType: 'Marker Gene 3'
              }, {
                path: 'obs/marker_gene_4',
                name: 'Marker Gene 4',
                obsLabelsType: 'Marker Gene 4'
              }
            ]
          }
        }
      ]
    }
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'A'
    },
    embeddingType: {
      A: 'UMAP'
    },
    obsLabelsType: {
      A: 'Marker Gene 0',
      B: 'Marker Gene 1',
      C: 'Marker Gene 2',
      D: 'Marker Gene 3',
      E: 'Marker Gene 4',
    }
  },
  layout: [{
    component: 'scatterplot',
    x: 0, y: 0, w: 9, h: 6,
    coordinationScopes: {
      dataset: 'A',
      embeddingType: 'A',
      obsLabelsType: ['A', 'B', 'C', 'D', 'E'],
    }
  }, {
    component: 'obsSets',
    x: 9, y: 0, w: 3, h: 3,
    coordinationScopes: {
      dataset: 'A',
      obsLabelsType: ['A', 'B', 'C', 'D', 'E'],
    }
  }, {
    component: 'featureList',
    x: 9, y: 4, w: 3, h: 3,
    coordinationScopes: {
      dataset: 'A',
      obsLabelsType: ['A', 'B', 'C', 'D', 'E'],
    }
  }, {
    component: 'obsSetFeatureValueDistribution',
    x: 7, y: 6, w: 5, h: 4,
    coordinationScopes: {
      dataset: 'A',
      obsLabelsType: ['A', 'B', 'C', 'D', 'E'],
    }
  }, {
    component: 'heatmap',
    x: 0, y: 6, w: 7, h: 4,
    coordinationScopes: {
      dataset: 'A',
      obsLabelsType: ['A', 'B', 'C', 'D', 'E'],
    }
  }]
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
  exports.config = vitessceConfig;
}