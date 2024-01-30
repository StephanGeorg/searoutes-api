import { expect } from 'chai';

import SeaRoutesService from '../../src/services/searoutes';

describe('Sea routes Service', () => {
  it('should return a sea route', (done) => {
    SeaRoutesService.init();
    const seaRoute = SeaRoutesService
      .getShortestRoute([13.5029, 43.6214], [20.2621, 39.4982], true);
    const { distance, distanceNM } = seaRoute;
    expect(distance).to.be.equal(746.2547255293554);
    expect(distanceNM).to.be.equal(402.94546283265413);
    done();
  }).timeout(10000);
});
