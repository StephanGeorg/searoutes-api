import { expect } from 'chai';
import * as turf from '@turf/turf';

import SeaRoutesService from '../../src/services/searoutes';

const util = require('util');

describe('Sea routes Service', () => {
  before(function() {
    // Runs once before all tests in this describe block
    this.timeout(0);
    SeaRoutesService.init();
  });

  it('should snap point to nearest vertex', (done) => {
    const point = turf.point([121.7703083786198, 25.137203876821086]);
    const vertex = SeaRoutesService.snapPointToVertex(point);

    expect(vertex.geometry.coordinates).to.deep.equal([121.7458, 25.146]);
    expect(vertex.geometry.type).to.deep.equal('Point');

    done();
  });

  it('should return sea route distance', (done) => {
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

  it('should return antimeridian sea route distances (CAVAN <- CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [117.7006, 38.9847],
        [-123.1203, 49.2705],
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

  it('should return antimeridian sea route distances (TWKEL <- MXMZT)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [-106.406200, 23.232900],
        [121.714048, 25.138440],
        false,
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(12920.376288015614);
    expect(distanceNM).to.be.equal(6976.447619348047);

    // Debugging
    // console.log('%o', seaRoute);
    // console.log(util.inspect(seaRoute.path, false, null, true /* enable colors */))

    done();
  });

  it('should return a sea route path geometry', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [13.5029, 43.6214],
        [20.2621, 39.4982],
        true,
      );
    const { path } = seaRoute;

    expect(path).to.not.equal(undefined);
    expect(path.type).to.equal('Feature');
    expect(path.geometry.type).to.equal('LineString');
    expect(path.geometry.coordinates.length).to.be.greaterThan(0);

    done();
  });

  it('should return antimeridian sea route path (CAVAN -> CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [-123.1203, 49.2705],
        [117.7006, 38.9847],
        true,
      );
    const { path } = seaRoute;

    expect(path).to.not.equal(undefined);
    expect(path.type).to.equal('Feature');
    expect(path.geometry.type).to.equal('MultiLineString');
    expect(path.geometry.coordinates.length).to.be.equal(2);
    done();
  });

  it('should return antimeridian sea route path (CAVAN <- CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [117.7006, 38.9847],
        [-123.1203, 49.2705],
        true,
      );
    const { path } = seaRoute;

    expect(path).to.not.equal(undefined);
    expect(path.type).to.equal('Feature');
    expect(path.geometry.type).to.equal('MultiLineString');
    expect(path.geometry.coordinates.length).to.be.equal(2);
    done();
  });
});
