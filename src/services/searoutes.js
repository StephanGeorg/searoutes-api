import PathFinder from 'geojson-path-finder';
import Flatbush from 'flatbush';
import * as turf from '@turf/turf';
import splitGeoJSON from 'geojson-antimeridian-cut';

import {
  triplicateGeoJSON,
  haversine,
  normalizePair,
  unwrapPath,
} from '../utils/helper/geo';

const geojson = require('../../data/eurostat.json');

let pathFinder;
let pathFinderTradeRoutes;
let vertices;
let index;

export default {
  /* customEdgeReducer(a, b) {
    // console.log('reducer', { a, b, p });
  }, */
  /* customEdgeDataSeed(a, b, p) {
    // return a;
  }, */
  /**
   * Custom weight function for edges
   * @param {*} a from edge
   * @param {*} b to edge
   * @param {*} edgeData props of the edge
   * @returns number
   */
  customWeight(a, b, edgeData) {
    const blockedEdges = [
      40019, // Suez channel
      // 40535, // Panama channel
      // 14052, // Sunda strait
      // 73448, // Sunda strait
      85565, // NWP
      106668, // NEP
    ];
    return blockedEdges.includes(edgeData.fid)
      ? Infinity
      : Math.trunc(haversine(a, b));
  },

  /**
   * Initialize sea routes data from geojson
   */
  init() {
    // Load vertices from routes
    console.time('Indexing vertices data');
    vertices = turf.coordAll(geojson).map((coords) => coords);
    index = new Flatbush(vertices.length);
    vertices.forEach((vertex) => {
      index.add(vertex[0], vertex[1], vertex[0], vertex[1]);
    });
    index.finish();
    console.timeEnd('Indexing vertices data');

    console.time('Triplicating GeoJSON');
    const tripled = triplicateGeoJSON(geojson);
    console.timeEnd('Triplicating GeoJSON');

    console.time('Generating path');
    // Standard pathfinder
    pathFinder = new PathFinder(tripled, {
      // tolerance: 1e-7, // Custom tolerance
      // weight: (a, b, edgeData) => this.customWeight(a, b, edgeData), // Custom weight function
      weight: (a, b) => Math.trunc(haversine(a, b)), // Standard haversine weight
      // edgeDataReducer: (a, b, p) => this.customEdgeReducer(a, b, p), // Custom edge data reducer
      // edgeDataSeed: (a, b, p) => this.customEdgeDataSeed(a, b, p), // Custom edge data seed
    });
    // Optimized trade routes pathfinder (no NWP, NEP, Suez)
    pathFinderTradeRoutes = new PathFinder(tripled, {
      weight: (a, b, edgeData) => this.customWeight(a, b, edgeData), // Custom weight function
    });
    console.timeEnd('Generating path');
  },

  /**
   * Get the pathfinder instance
   * @param {*} options Query options
   * @returns object
   */
  getPathFinder(options = {}) {
    const { network } = options;
    switch (network) {
      case 'trade':
        return pathFinderTradeRoutes;
      case 'default':
      case 'normal':
      case 'all':
      default:
        return pathFinder;
    }
  },

  getVertices() {
    return vertices;
  },

  getVertex(id) {
    if (!id) return null;
    return this.getVertices()[id];
  },

  /**
   * Snap a point to nearest vertex of the network
   * @param {object} point
   * @returns {object}
   */
  snapPointToVertex(point = {}) {
    if (!point) return null;
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
  getShortestPath(startPoint = {}, endPoint = {}, options = {}) {
    const { path = false } = options;
    const start = startPoint.geometry.coordinates;
    const end = endPoint.geometry.coordinates;
    const [A, B] = normalizePair(start, end);

    // Turn A and B into geojson with turf.point
    const AasGeoJSON = turf.point(A);
    const BasGeoJSON = turf.point(B);

    const res = this.getPathFinder(options).findPath(AasGeoJSON, BasGeoJSON);
    return res
      ? {
        ...res,
        path: path === true ? splitGeoJSON(turf.lineString(unwrapPath(res.path))) : undefined,
        distance: res.weight / 1000,
        distanceNM: Number(((res.weight / 1000) * 0.539957).toFixed(2)),
      } : null;
  },

  /**
   * Get shortest route between two points snapped to network
   * @param {*} startPoint
   * @param {*} endPoint
   * @returns
   */
  getShortestRoute(startPoint = [], endPoint = [], options = {}) {
    const start = turf.point(startPoint);
    const end = turf.point(endPoint);

    // Snap coords to network
    const startPointSnapped = this.snapPointToVertex(start);
    const endPointSnapped = this.snapPointToVertex(end);

    if (!startPointSnapped || !endPointSnapped) throw new Error('Point missing');

    // Get shortest path from network
    const shortestPath = this.getShortestPath(
      startPointSnapped,
      endPointSnapped,
      options,
    );

    return shortestPath;
  },

};
