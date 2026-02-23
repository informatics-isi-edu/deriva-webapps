import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { BooleanSearchConfig } from '@isrd-isi-edu/deriva-webapps/src/models/boolean-search-config';

import { HeatmapConfig } from '@isrd-isi-edu/deriva-webapps/src/models/heatmap-config';
import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { DataConfig, PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { TreeviewConfig } from '@isrd-isi-edu/deriva-webapps/src/models/treeview';
import { DerivaVitessceConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

interface WebAppCustomWindow extends ICustomWindow {
  audiogramConfig: DataConfig;
  booleanSearchConfig: BooleanSearchConfig
  heatmapConfig: HeatmapConfig;
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
  treeviewConfigs: TreeviewConfig;
  vitessceConfigs: DerivaVitessceConfig;
  setSourceForFilter: any
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
