export type VitessceTemplateParams = {
  $url_parameters: {
    [paramKey: string]: string;
  }
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
    version: string;
    name: string;
    description: string;
    datasets: any[];
    initStrategy: string;
    coordinationSpace: any;
    layout: VitessceLayoutConfig[];
  }
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