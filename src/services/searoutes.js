import PathFinder from 'geojson-path-finder';
import Flatbush from 'flatbush';
import * as turf from '@turf/turf';

const geojson = require('../../data/eurostat.json');

let pathFinder;
let vertices;
let index;

export default {
  /**
   * Initialize searoutes data from geojson
   */
  init() {
    // Load vertices from routes
    console.time('Preparing data ...');
    vertices = turf.coordAll(geojson).map((coords) => coords);
    index = new Flatbush(vertices.length);
    vertices.forEach((vertex) => {
      index.add(vertex[0], vertex[1], vertex[0], vertex[1]);
    });
    index.finish();
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

  getVertices() {
    return vertices;
  },

  getVertex(id) {
    if (!id) return null;
    return this.getVertices()[id];
  },

  snapPointToVertex(point = {}) {
    const neighborId = index.neighbors(
      point.geometry.coordinates[0],
      point.geometry.coordinates[1],
      1,
    );
    return turf.point(this.getVertex(neighborId[0]));
  },

  /**
   * Get the shortest path between two points
   * @param {object} startPoint
   * @param {object} endPoint
   * @returns
   */
  getShortestPath(startPoint = {}, endPoint = {}, returnPath = true) {
    const path = this.getPathFinder().findPath(startPoint, endPoint);
    return path
      ? {
        path: returnPath === true ? turf.lineString(path.path) : undefined,
        distance: path.weight,
        distanceNM: path.weight * 0.539957,
      } : null;
  },

  /**
   * Get shortest route between two points snapped to network
   * @param {*} startPoint
   * @param {*} endPoint
   * @returns
   */
  getShortestRoute(startPoint = '', endPoint = '', returnPath) {
    const start = turf.point(startPoint);
    const end = turf.point(endPoint);

    // Snap coords to network
    const startPointSnapped = this.snapPointToVertex(start);
    const endPointSnapped = this.snapPointToVertex(end);

    const shortestPath = this.getShortestPath(startPointSnapped, endPointSnapped, returnPath);

    return shortestPath;
  },

};
