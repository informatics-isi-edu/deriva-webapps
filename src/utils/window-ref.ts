import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

import { BooleanSearchConfig } from '@isrd-isi-edu/deriva-webapps/src/models/boolean-search-config';
import { MatrixConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

interface WebAppCustomWindow extends ICustomWindow {
  booleanSearchConfig: BooleanSearchConfig
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
