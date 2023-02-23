import { ICustomWindow } from '@isrd-isi-edu/chaise/src/utils/window-ref';

interface WebAppCustomWindow extends ICustomWindow {
  matrixConfigs: any;
  plotConfigs: any;
}

declare let window: WebAppCustomWindow;

export const windowRef = window;
