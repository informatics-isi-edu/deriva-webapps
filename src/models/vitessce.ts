import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { ResponsiveProps as ResponsiveGridConfig } from 'react-grid-layout';

export type VitessceTemplateParams = {
  $self?: {
    [paramKey: string]: any;
  };
  $url_parameters: {
    [paramKey: string]: string;
  },
  $control_values: {
    [paramKey: string]: any;
  };
}

/**
 * Config file for vitessce
 */
export type DerivaVitessceConfig = {
  [name: string]: DerivaVitessceDataConfig;
};

/**
 * each named config inside the config file for vitessce
 */
export type DerivaVitessceDataConfig = {
  vitessce: {
    uid: string;
    height: number;
    theme: 'dark' | 'light' | null;
    config: {
      version: string;
      name: string;
      description: string;
      datasets: any[];
      initStrategy: string;
      coordinationSpace: any;
      layout: any[];
    }
  },
  grid_layout_config?: ResponsiveGridConfig;
  user_controls?: UserControlConfig[];
};