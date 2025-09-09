/**
 * @fileoverview Geographic utility functions for maritime route calculations
 * Provides functions for coordinate manipulation, distance calculation, and
 * handling antimeridian crossing in global maritime routing applications.
 */

/**
 * Earth's radius in meters
 * @constant {number}
 */
const R_EARTH = 6371000;

/**
 * Pre-computed constant for degree to radian conversion
 * @constant {number}
 */
const DEG_TO_RAD = Math.PI / 180;

/**
 * Shift longitude coordinate by a given offset (optimized)
 * @param {Array<number>} coord - Coordinate array [longitude, latitude]
 * @param {number} dx - Longitude offset to apply
 * @returns {Array<number>} Shifted coordinate [longitude + dx, latitude]
 */
function shiftLon(coord, dx) {
  // Direct array access is faster than destructuring
  // Longitude wrapping: Add offset to handle antimeridian crossing scenarios
  // This is essential for global routing where paths may cross the 180°/-180° boundary
  return [coord[0] + dx, coord[1]];
}

/**
 * Calculate the haversine distance between two geographic points (optimized)
 * Uses the haversine formula to determine the great-circle distance between
 * two points on Earth given their latitude and longitude
 * @param {Array<number>} a - First point [longitude, latitude]
 * @param {Array<number>} b - Second point [longitude, latitude]
 * @returns {number} Distance in meters
 */
export const haversine = (a, b) => {
  // Inline coordinate extraction for better performance
  const lon1 = a[0];
  const lat1 = a[1];
  const lon2 = b[0];
  const lat2 = b[1];

  // Convert to radians with optimized inline calculation
  const dφ = (lat2 - lat1) * DEG_TO_RAD; // Latitude difference in radians
  const dλ = (lon2 - lon1) * DEG_TO_RAD; // Longitude difference in radians
  const φ1 = lat1 * DEG_TO_RAD; // First point latitude in radians
  const φ2 = lat2 * DEG_TO_RAD; // Second point latitude in radians

  // Haversine formula: calculates great-circle distance on a sphere
  // Optimized by computing sine values once and reusing
  const sinHalfDφ = Math.sin(dφ * 0.5);
  const sinHalfDλ = Math.sin(dλ * 0.5);
  const s = sinHalfDφ * sinHalfDφ + Math.cos(φ1) * Math.cos(φ2) * sinHalfDλ * sinHalfDλ;

  // Apply the inverse haversine to get the angular distance
  // Then multiply by Earth's radius to get the actual distance in meters
  return 2 * R_EARTH * Math.asin(Math.sqrt(s));
};

/**
 * Shift all coordinates in a geometry by a longitude offset
 * Recursively processes nested coordinate arrays to handle different geometry types
 * @param {Object} geom - GeoJSON geometry object
 * @param {number} dx - Longitude offset to apply to all coordinates
 * @returns {Object} New geometry object with shifted coordinates
 */
function shiftGeometry(geom, dx) {
  // Recursive function to handle nested coordinate structures in GeoJSON
  // GeoJSON geometries can have varying levels of nesting:
  // - Point: [lon, lat]
  // - LineString: [[lon, lat], [lon, lat], ...]
  // - Polygon: [[[lon, lat], [lon, lat], ...], ...]
  // - MultiPolygon: [[[[lon, lat], ...]], ...]
  const mapCoords = (coords) => coords.map((c) => (
    Array.isArray(c[0]) ? mapCoords(c) : shiftLon(c, dx) // Recursively process or shift coordinate
  ));

  // Preserve geometry type while transforming coordinates
  // This maintains GeoJSON specification compliance
  return { type: geom.type, coordinates: mapCoords(geom.coordinates) };
}

/**
 * Create three copies of GeoJSON features shifted by -360°, 0°, and +360° longitude (optimized)
 * This handles antimeridian crossing by creating wraparound copies for global routing
 * @param {Object} fc - GeoJSON FeatureCollection
 * @returns {Object} New FeatureCollection with tripled features across longitude wraps
 */
export function triplicateGeoJSON(fc) {
  // Define longitude shifts: -360°, 0°, +360°
  // This creates three "worlds" to handle antimeridian crossing
  // Essential for global maritime routing where ships can cross the International Date Line
  const shifts = [-360, 0, 360];

  // Pre-allocate array for better performance
  const originalCount = fc.features.length;
  const features = new Array(originalCount * 3);

  // Create three copies of each feature with different longitude offsets
  // This allows pathfinding algorithms to find routes that cross 180°/-180° meridian
  // without artificial barriers at the antimeridian
  let index = 0;
  for (let i = 0; i < originalCount; i++) {
    const feature = fc.features[i];
    for (let j = 0; j < 3; j++) {
      const dx = shifts[j];
      features[index++] = {
        type: 'Feature',
        properties: { ...feature.properties, __wrapShift: dx }, // Track which "world"
        geometry: shiftGeometry(feature.geometry, dx), // Apply longitude shift to geometry
      };
    }
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Normalize longitude values in a path to the standard [-180, 180] range (optimized)
 * Converts wrapped longitude coordinates back to standard range for rendering
 * @param {Array<Array<number>>} path - Array of coordinate pairs [[lon, lat], ...]
 * @returns {Array<Array<number>>} Path with normalized longitude values
 */
export function unwrapPath(path) {
  // Convert coordinates back to standard longitude range [-180°, 180°]
  // This is necessary after pathfinding on tripled geometries
  return path.map(([lon, lat]) => {
    // Optimized normalization using modulo operation instead of while loops
    // Handle cases where pathfinding used shifted coordinates from -540° to +540°
    let x = ((lon + 180) % 360) - 180;

    // Handle edge case for exactly -180
    if (x === -180 && lon > 0) x = 180;

    return [x, lat]; // Latitude remains unchanged as it doesn't wrap
  });
}

/**
 * Normalize a pair of coordinates to handle antimeridian crossing (optimized)
 * Adjusts longitude values when the distance between points crosses 180° meridian
 * to ensure shortest path calculation across the antimeridian
 * @param {Array<number>} a - First coordinate [longitude, latitude]
 * @param {Array<number>} b - Second coordinate [longitude, latitude]
 * @returns {Array<Array<number>>} Normalized coordinate pair [[lonA, latA], [lonB, latB]]
 */
export function normalizePair(a, b) {
  // Extract longitude and latitude using direct array access for performance
  let lonA = a[0]; // Longitude can be modified
  let lonB = b[0];
  const latA = a[1]; // Latitude remains constant
  const latB = b[1];

  // Check if the longitude difference crosses the antimeridian
  // If the absolute difference > 180°, we're dealing with antimeridian crossing
  // Example: -170° to +170° = 340° difference, but actual shortest path is 20°
  if (Math.abs(lonA - lonB) > 180) {
    // Adjust coordinates to same hemisphere for shortest path calculation
    // This ensures distance calculation uses the shorter route across antimeridian
    // Example: -170° and +170° → -170° and -190° (or +190° and +170°)
    if (lonA < lonB) lonA += 360; // Move western point to eastern hemisphere
    else lonB += 360; // Move western point to eastern hemisphere
  }

  return [[lonA, latA], [lonB, latB]];
}
