declare module '*.jpg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.gif';
declare module 'plotly.js-basic-dist-min';
declare module 'plotly.js-cartesian-dist-min';
/*
 * react-plotly.js v4 ships its own types, but only exposes them through an "exports" map that
 * this project's moduleResolution ("node") cannot read. Drop this once the tsconfig moves to
 * "bundler", the way chaise already has.
 */
declare module 'react-plotly.js/factory';
declare module 'vitessce';
