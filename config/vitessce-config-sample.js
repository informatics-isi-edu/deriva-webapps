/**
 * Please Note
 * This is a sample configuration file.
 */
var vitessceConfigs = {
  // mimics the vitessce component on this page:
  // https://portal.hubmapconsortium.org/browse/dataset/f47349f1e0fea69263a8d68c7dac65c5
  'hubmap': {
    height: 1000,
    theme: 'light',
    vitessce: {
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
                  },
                  {
                    path: 'obs/predicted_label',
                    name: 'Cell Ontology Annotation'
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
    }
  },
  // data is deployed in /var/www/html/data/scrna_hubmap on dev.atlas-d2k server only (for now)
  'single-cell': {
    height: 800, // default is 800
    theme: 'light', // default is 'light', 'dark' and `null` also allowed
    vitessce: {
      uid: 'vitessce',
      version: '1.0.15',
      name: 'vitessce configuration in deriva-webapps',
      description: 'References data from atlas-d2k',
      datasets: [
        {
          uid: 'A',
          name: 'deriva-webapps vitessce',
          files: [
            {
              fileType: 'anndata.zarr.zip',
              // read a url parameter to get the dataset id to point to the folder with the data in it
              url_pattern: '/data/scrna_hubmap/study_{{{$url_parameters.study}}}/r_{{{$control_values.replicate.values.RID}}}/hubmap-ui/anndata-zarr/secondary_analysis.zarr.zip',
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
                  },
                  {
                    path: 'obs/predicted_label',
                    name: 'Cell Ontology Annotation'
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
      }],
    },
    user_controls: [
      {
        uid: 'replicate',
        label: 'Replicate',
        type: 'dropdown',
        url_param_key: 'replicate',
        request_info: {
          data: [{
            RID: '16-2PRA',
            Display: '16-2PRA: (1, 1)'
          }, {
            RID: '16-2PRC',
            Display: '16-2PRC: (1, 1)'
          }],
          default_value: '16-2PRA',
          value_key: 'RID',
          selected_value_pattern: '{{{$self.values.Display}}}'
        }
      }
    ],
    grid_layout_config: {
      // This allows setting the initial width on the server side.
      width: 1200,
      auto_size: true,
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
      cols: 12,
      margin: { lg: [5, 5], md: [10, 10], sm: [9, 9], xs: [5, 5] },
      row_height: 50,
      layouts: {
        lg: [{
          source_uid: 'replicate',
          x: 0, y: 0, w: 4, h: 1,
          static: true,
        },
        {
          source_uid: 'vitessce',
          x: 0, y: 1, w: 12, h: 20,
          static: true,
        }],
        md: [{
          source_uid: 'replicate',
          x: 0, y: 0, w: 3, h: 1,
          static: true,
        }, {
          source_uid: 'vitessce',
          x: 0, y: 1, w: 12, h: 12,
          static: true,
        }],
        sm: [{
          source_uid: 'replicate',
          x: 0, y: 0, w: 4, h: 1,
          static: true,
        }, {
          source_uid: 'vitessce',
          x: 0, y: 1, w: 12, h: 12,
          static: true,
        }],
        xs: [{
          source_uid: 'replicate',
          x: 0, y: 0, w: 6, h: 1,
          static: true,
        }, {
          source_uid: 'vitessce',
          x: 0, y: 1, w: 12, h: 12,
          static: true,
        }]
      },
    }
  }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
  exports.config = vitessceConfigs;
}