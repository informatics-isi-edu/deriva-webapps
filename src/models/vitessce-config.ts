export type DerivaVitessceConfig = {
  version: string;
  name: string;
  description: string;
  datasets: any[];
  initStrategy: string;
  coordinationSpace: any;
  layout: VitessceLayoutConfig[];
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