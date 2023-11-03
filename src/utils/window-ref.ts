import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { BooleanSearchConfig } from '@isrd-isi-edu/deriva-webapps/src/models/boolean-search-config';

import { HeatmapConfig } from '@isrd-isi-edu/deriva-webapps/src/models/heatmap-config';
import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

interface WebAppCustomWindow extends ICustomWindow {
  booleanSearchConfig: BooleanSearchConfig
  heatmapConfig: HeatmapConfig;
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
  setSourceForFilter: any
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
