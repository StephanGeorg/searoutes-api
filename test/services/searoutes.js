import { expect } from 'chai';
import * as turf from '@turf/turf';

import SeaRoutesService from '../../src/services/searoutes';

// const util = require('util'); // Used for debugging

describe('Sea routes Service', () => {
  before(function beforeAllTests() {
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
        { path: false },
      );
    const { distance, distanceNM } = seaRoute;
    expect(distance).to.be.equal(746.199);
    expect(distanceNM).to.be.equal(402.92);
    done();
  });

  it('should return antimeridian sea route distances (CAVAN -> CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [-123.1203, 49.2705],
        [117.7006, 38.9847],
        { path: false },
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(10560.571);
    expect(distanceNM).to.be.equal(5702.25);
    done();
  });

  it('should return antimeridian sea route distances (CAVAN <- CNTXG)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [117.7006, 38.9847],
        [-123.1203, 49.2705],
        { path: false },
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(10560.571);
    expect(distanceNM).to.be.equal(5702.25);
    done();
  });

  it('should return antimeridian sea route distances (TWKEL -> MXMZT)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [121.714048, 25.138440],
        [-106.406200, 23.232900],
        { path: false },
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(12920.344);
    expect(distanceNM).to.be.equal(6976.43);

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
        { path: false },
      );
    const { distance, distanceNM } = seaRoute;

    expect(distance).to.be.equal(12920.344);
    expect(distanceNM).to.be.equal(6976.43);

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
        { path: true },
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
        { path: true },
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
        { path: true },
      );
    const { path } = seaRoute;

    expect(path).to.not.equal(undefined);
    expect(path.type).to.equal('Feature');
    expect(path.geometry.type).to.equal('MultiLineString');
    expect(path.geometry.coordinates.length).to.be.equal(2);
    done();
  });

  it('should return sea route path from trade optimized network (CNSGH  <- DEHAM)', (done) => {
    const seaRoute = SeaRoutesService
      .getShortestRoute(
        [121.48, 31.23],
        [9.93, 53.52],
        { path: true, network: 'trade' },
      );
    const { path, distance, distanceNM } = seaRoute;

    // Debugging
    /* console.log(util.inspect(seaRoute.path, {
      depth: null,
      colors: false,
      maxArrayLength: null,
    })); */

    expect(distance).to.be.equal(26269.169);
    expect(distanceNM).to.be.equal(14184.22);
    expect(path).to.not.equal(undefined);
    expect(path.type).to.equal('Feature');
    expect(path.geometry.type).to.equal('LineString');
    expect(path.geometry.coordinates.length).to.be.equal(446);
    done();
  });
});
