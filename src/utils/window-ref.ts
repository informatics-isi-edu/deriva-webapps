import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

interface WebAppCustomWindow extends ICustomWindow {
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
