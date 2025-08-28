import { expect } from 'chai';

const util = require('util');

import * as turf from '@turf/turf';

import { 
  buildEdgeFCFromLineStrings,
  prepareTripleWorldFromEdges,
  augmentTripleWorldWithConnectors,
  buildPathFinderTripleWorld,
  findDatelineSafePath } from '../../src/services/searoutes';

const geojson = require('../../data/eurostat.json');

describe('Sea routes Service', () => {
  it('should return a sea route', (done) => {
    // 1) Linien bereinigen & in Ein-Segment-Kanten zerlegen
    const edges = buildEdgeFCFromLineStrings(geojson);

    // 2) Triple-World bauen
    const tw = prepareTripleWorldFromEdges(edges);

    // 3) (Empfohlen) Start/Ziel-Connectoren hinzufügen
    const end = [-123.1203, 49.2705];
    const start = [117.7006, 38.9847];
    const twAug = augmentTripleWorldWithConnectors(tw, start, end, { maxConnectorKm: 300 });

    // 4) PathFinder bauen
    const pf = buildPathFinderTripleWorld(twAug, { precision: 1e-5 });

    // 5) Route finden (nimmt automatisch den kürzesten der drei Shifts)
    const res = findDatelineSafePath(pf, start, end);

    if (!res) {
      console.error('Keine Route gefunden.');
    } else {
      console.log('benutzter Shift:', res.usedShift);
      console.log('Distanz [km]:', (res.weight / 1000).toFixed(2));
      // console.log('Pfad (lon/lat in [−180,180]):', res.path);

      // console.log('%o', turf.lineString(res.path));
      console.log(util.inspect(turf.lineString(res.path), false, null, false));
    }
    done();
  }).timeout(100000);
});
