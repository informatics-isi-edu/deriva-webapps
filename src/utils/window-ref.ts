import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { HeatmapConfig } from '@isrd-isi-edu/deriva-webapps/src/models/heatmap-config';
import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

interface WebAppCustomWindow extends ICustomWindow {
  heatmapConfig: HeatmapConfig;
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
