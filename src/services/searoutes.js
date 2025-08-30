import PathFinder from 'geojson-path-finder';
import Flatbush from 'flatbush';
import * as turf from '@turf/turf';
import splitGeoJSON from 'geojson-antimeridian-cut';

import {
  triplicateGeoJSON,
  haversineMeters,
  normalizePair,
  unwrapPath,
} from '../utils/helper/geo';

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
    pathFinder = new PathFinder(tripled, {
      // tolerance: 1e-7, // Custom tolerance
      weight: (a, b) => haversineMeters(a, b), // Custom weight function
      // edgeDataReducer: (a, p) => ( p.id), // Custom edge data reducer
      // edgeDataSeed: (properties) => (properties.id), // Custom edge data seed
    });
    console.timeEnd('Generating path');
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
  getShortestPath(startPoint = {}, endPoint = {}, returnPath = true) {
    const start = startPoint.geometry.coordinates;
    const end = endPoint.geometry.coordinates;
    const [A, B] = normalizePair(start, end);

    // Turn A and B into geojson with turf.point
    const AasGeoJSON = turf.point(A);
    const BasGeoJSON = turf.point(B);

    const res = this.getPathFinder().findPath(AasGeoJSON, BasGeoJSON);
    return res
      ? {
        ...res,
        path: returnPath === true ? splitGeoJSON(turf.lineString(unwrapPath(res.path))) : undefined,
        distance: res.weight / 1000,
        distanceNM: (res.weight / 1000) * 0.539957,
      } : null;
  },

  /**
   * Get shortest route between two points snapped to network
   * @param {*} startPoint
   * @param {*} endPoint
   * @returns
   */
  getShortestRoute(startPoint = [], endPoint = [], returnPath) {
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
      returnPath,
    );

    return shortestPath;
  },

};
