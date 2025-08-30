import { expect } from 'chai';

import SeaRoutesService from '../../src/services/searoutes';

const util = require('util');

describe('Sea routes Service', () => {
  before(function() {
    // Runs once before all tests in this describe block
    this.timeout(0);
    SeaRoutesService.init();
  });

  it('should return a sea route distances', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [13.5029, 43.6214],
        [20.2621, 39.4982],
        false,
      );
    const { distance, distanceNM } = seaRoute;
    expect(distance).to.be.equal(746.2536947598509);
    expect(distanceNM).to.be.equal(402.9449062614448);
    done();
  });

  it('should return antimeridian sea route distances (CAVAN -> CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [-123.1203, 49.2705],
        [117.7006, 38.9847],
        false,
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(10560.60953774451);
    expect(distanceNM).to.be.equal(5702.275044171913);
    done();
  });

  it('should return antimeridian sea route distances (TWKEL -> MXMZT)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [121.714048, 25.138440],
        [-106.406200, 23.232900],
        false,
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(12920.376288015616);
    expect(distanceNM).to.be.equal(6976.447619348048);

    // Debugging
    // console.log('%o', seaRoute);
    // console.log(util.inspect(seaRoute.path, false, null, true /* enable colors */))

    done();
  });
});
