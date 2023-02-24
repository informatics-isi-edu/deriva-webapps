import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';
import { MatrixConfig } from '../models/matrix-config';
import { PlotConfig } from '../models/plot-config';

interface WebAppCustomWindow extends ICustomWindow {
  matrixConfigs: MatrixConfig;
  plotConfigs: PlotConfig;
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
