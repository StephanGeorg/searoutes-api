import { expect } from 'chai';

const util = require('util');

import SeaRoutesService from '../../src/services/searoutes';

describe('Sea routes Service', () => {
  it('should return a sea route', (done) => {
    SeaRoutesService.init();
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [-123.1203, 49.2705],
        [117.7006, 38.9847],
        true,
      );
    // const { distance, distanceNM } = seaRoute;

    console.log('%o', seaRoute);

    // expect(distance).to.be.equal(746.2547255293554);
    // expect(distanceNM).to.be.equal(402.94546283265413);
    done();
  }).timeout(1000000);

  it('should return a sea route', (done) => {
    SeaRoutesService.init();
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [121.714048, 25.138440],
        [-106.406200, 23.232900],
        true,
      );
    // const { distance, distanceNM } = seaRoute;

    console.log('%o', seaRoute);

    console.log(util.inspect(seaRoute.path, false, null, true /* enable colors */))

    // expect(distance).to.be.equal(746.2547255293554);
    // expect(distanceNM).to.be.equal(402.94546283265413);
    done();
  }).timeout(1000000);
});
