import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { ResponsiveProps as ResponsiveGridConfig } from 'react-grid-layout';

export type VitessceTemplateParams = {
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
  height: number;
  theme: 'dark' | 'light' | null;
  vitessce: {
    uid: string;
    version: string;
    name: string;
    description: string;
    datasets: any[];
    initStrategy: string;
    coordinationSpace: any;
    layout: VitessceLayoutConfig[];
  },
  grid_layout_config?: ResponsiveGridConfig;
  user_controls: UserControlConfig[];
};

export type VitessceLayoutConfig = {
  component: string;
  props: { 
    description: string; 
  };
  x: number;
  y: number;
  w: number;
  h: number;
}