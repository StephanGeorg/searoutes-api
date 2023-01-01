import PathFinder from 'geojson-path-finder';
import * as turf from '@turf/turf';

const geojson = require('../../../data/eurostat.json');

let pathFinder;
let verticesFeatureCollection;

export default {
  init() {
    // Load vertices from routes
    console.time('Preparing data ...');
    const vertices = turf.coordAll(geojson).map((coords) => turf.point(coords));
    verticesFeatureCollection = turf.featureCollection(vertices);
    console.timeEnd('Preparing data ...');
    // Generate path
    console.time('Generate path ...');
    pathFinder = new PathFinder(geojson, {
      // edgeDataReducer: (a, p) => ( p.id),
      // edgeDataSeed: (properties) => (properties.id),
    });
    console.timeEnd('Generate path ...');
  },

  getPathFinder() {
    return pathFinder;
  },

  getVerticesFeatureCollection() {
    return verticesFeatureCollection;
  },

};
