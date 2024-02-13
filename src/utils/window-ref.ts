import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { BooleanSearchConfig } from '@isrd-isi-edu/deriva-webapps/src/models/boolean-search-config';

import { HeatmapConfig } from '@isrd-isi-edu/deriva-webapps/src/models/heatmap-config';
import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { TreeviewConfig } from '@isrd-isi-edu/deriva-webapps/src/models/treeview';
import { DerivaVitessceConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce-config';

interface WebAppCustomWindow extends ICustomWindow {
  booleanSearchConfig: BooleanSearchConfig
  heatmapConfig: HeatmapConfig;
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
  treeviewConfigs: TreeviewConfig;
  vitessceConfig: DerivaVitessceConfig;
  setSourceForFilter: any
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
