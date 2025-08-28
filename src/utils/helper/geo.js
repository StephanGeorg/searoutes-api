const R_EARTH = 6371000; // Meter
const toRad = (d) => d * Math.PI / 180;

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

// verhindert 359°-Sprünge innerhalb einer Linie
export const unwrapLineString = (coords) => {
  if (!coords || coords.length < 2) return coords;
  const out = [coords[0].slice()];
  for (let i = 1; i < coords.length; i++) {
    const prev = out[i - 1];
    let [lon, lat] = coords[i];
    let d = lon - prev[0];
    if (d > 180) lon -= 360;
    else if (d < -180) lon += 360;
    out.push([lon, lat]);
  }
  return out;
};

export const shiftLine = (coords, S) => coords.map(([lon, lat]) => [lon + S, lat]);

export const normalizeTo180 = (coords) => {
  if (!coords.length) return coords;
  const unwrapped = unwrapLineString(coords);
  return unwrapped.map(([lon, lat]) => {
    const L = ((lon + 180) % 360 + 360) % 360 - 180;
    return [L, lat];
  });
};
