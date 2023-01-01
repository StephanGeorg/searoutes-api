import PathFinder from 'geojson-path-finder';
import * as turf from '@turf/turf';

const geojson = require('../../data/eurostat.json');

let pathFinder;
let verticesFeatureCollection;

export default {
  /**
   * Initialize searoutes data from geojson
   */
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

  snapPointToVertex(point = {}) {
    // if (!turf.booleanValid(point)) return null;
    return turf.nearestPoint(point, verticesFeatureCollection);
  },

  /**
   * Get the shortest path between two points
   * @param {object} startPoint
   * @param {object} endPoint
   * @returns
   */
  getShortestPath(startPoint = {}, endPoint = {}) {
    const path = pathFinder.findPath(startPoint, endPoint);
    return path
      ? {
        path: turf.lineString(path.path),
        distance: path.weight,
        distanceNM: path.weight * 0.539957,
      } : null;
  },

  /**
   *
   * @param {*} startPoint
   * @param {*} endPoint
   * @returns
   */
  getRoute(startPoint = '', endPoint = '') {
    const start = turf.point(startPoint);
    const end = turf.point(endPoint);

    const startPointSnapped = this.snapPointToVertex(start);
    const endPointSnapped = this.snapPointToVertex(end);

    return this.getShortestPath(startPointSnapped, endPointSnapped);
  },

};
