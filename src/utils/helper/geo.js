const R_EARTH = 6371000;
const toRad = (d) => (d * Math.PI) / 180;

function shiftLon(coord, dx) {
  let [lon, lat] = coord;
  return [lon + dx, lat];
}

export const haversineMeters = (a, b) => {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dφ = toRad(lat2 - lat1);
  const dλ = toRad(lon2 - lon1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const s = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(s));
};

function shiftGeometry(geom, dx) {
  const mapCoords = (coords) => coords.map((c) =>
    Array.isArray(c[0]) ? mapCoords(c) : shiftLon(c, dx)
  );
  return { type: geom.type, coordinates: mapCoords(geom.coordinates) };
}

export function triplicateGeoJSON(fc) {
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

export function unwrapPath(path) {
  // Bring longitudes back to [-180, 180] for rendering
  return path.map(([lon, lat]) => {
    let x = lon;
    while (x > 180) x -= 360;
    while (x < -180) x += 360;
    return [x, lat];
  });
}

export function normalizePair(a, b) {
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
