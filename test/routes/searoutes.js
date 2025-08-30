import supertest from 'supertest';
import { expect } from 'chai';

import app from '../../src/server';

describe('Endpoint /api/searoutes/shortest/', () => {
  describe('GET /api/searoutes/shortest/:startPoint/:endPoint', () => {
    it('should return sea route distance', (done) => {
      supertest(app)
        .get('/api/searoutes/shortest/13.5029,43.6214/20.2621,39.4982')
        .expect(200)
        .end((err, res) => {
          const { body } = res;
          expect(body.distance).to.be.equal(746.2536947598509);
          expect(body.distanceNM).to.be.equal(402.9449062614448);
          done();
        });
    });
  });
});
