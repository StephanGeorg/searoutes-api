import PathFinder from 'geojson-path-finder';
import Flatbush from 'flatbush';
import * as turf from '@turf/turf';

const splitGeoJSON = require('geojson-antimeridian-cut');

const geojson = require('../../data/eurostat.json');

let pathFinder;
let vertices;
let index;


const R_EARTH = 6371000;
const toRad = d => d * Math.PI/180;
const haversineMeters = (a,b) => {
  const [lon1,lat1]=a,[lon2,lat2]=b;
  const dφ=toRad(lat2-lat1), dλ=toRad(lon2-lon1);
  const φ1=toRad(lat1), φ2=toRad(lat2);
  const s=Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return 2*R_EARTH*Math.asin(Math.sqrt(s));
};

function shiftLon(coord, dx) {
  let [lon, lat] = coord;
  return [lon + dx, lat];
}

function shiftGeometry(geom, dx) {
  const mapCoords = (coords) => coords.map(c =>
    Array.isArray(c[0]) ? mapCoords(c) : shiftLon(c, dx)
  );
  return { type: geom.type, coordinates: mapCoords(geom.coordinates) };
}

function triplicateGeoJSON(fc) {
  const shifts = [-360, 0, 360];
  const features = [];
  for (const f of fc.features) {
    for (const dx of shifts) {
      features.push({
        type: 'Feature',
        properties: { ...f.properties, __wrapShift: dx },
        geometry: shiftGeometry(f.geometry, dx),
      });
    }
  }
  return { type: 'FeatureCollection', features };
}

function unwrapPath(path) {
  // Bring longitudes back to [-180, 180] for rendering
  return path.map(([lon, lat]) => {
    let x = lon;
    while (x > 180) x -= 360;
    while (x < -180) x += 360;
    return [x, lat];
  });
}

function normalizePair(a, b) {
  // a, b are [lon, lat]
  let [lonA, latA] = a;
  let [lonB, latB] = b;

  if (Math.abs(lonA - lonB) > 180) {
    // Move the smaller one east or the larger one west—either is fine:
    if (lonA < lonB) lonA += 360;
    else lonB += 360;
  }
  return [[lonA, latA], [lonB, latB]];
}

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

    const tripled = triplicateGeoJSON(geojson);

    pathFinder = new PathFinder(tripled, {
      // tolerance: 1e-7,
      weight: (a, b) => haversineMeters(a, b),
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
    return {
      ...res,
      path: splitGeoJSON(turf.lineString(unwrapPath(res.path))),
      distance: res.weight / 1000,
      distanceNM: (res.weight / 1000) * 0.539957,
    };



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
