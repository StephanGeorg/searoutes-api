import supertest from 'supertest';
import { expect } from 'chai';

import app from '../../src/server';

describe('Endpoint /api/users', () => {
  describe('GET /api/users/list', () => {
    it('should return a list of users', (done) => {
      supertest(app)
        .get('/api/users/list')
        .expect(200)
        .end((err, res) => {
          const { body } = res;
          expect(body[0].id).to.be.equal(1);
          expect(body[0].name).to.be.equal('tom');
          done();
        });
    });
  });

  describe('GET /api/users/get/1', () => {
    it('should return with id 1 users', (done) => {
      supertest(app)
        .get('/api/users/get/1')
        .expect(200)
        .end((err, res) => {
          const { body } = res;
          expect(body.id).to.be.equal(1);
          expect(body.name).to.be.equal('tom');
          done();
        });
    });
  });

  describe('GET /api/users/get/2351435', () => {
    it('should fail for unknown user', (done) => {
      supertest(app)
        .get('/api/users/get/2351435')
        .expect(404)
        .end((err, res) => {
          const { body } = res;
          expect(err).to.be.equal(null);
          expect(body.statusCode).to.be.equal(404);
          expect(body.message).to.be.equal('User not found!');
          expect(body.error).to.be.equal('Not Found');
          done();
        });
    });
  });

  describe('POST /api/users/create', () => {
    it('should add a new user', (done) => {
      supertest(app)
        .post('/api/users/create')
        .send({
          name: 'frank',
        })
        .expect(201, done);
    });
  });

  describe('POST /api/users/create', () => {
    it('should fail due to validation error', (done) => {
      supertest(app)
        .post('/api/users/create')
        .send({
          id: 8,
        })
        .expect(400)
        .end((err, res) => {
          const { body } = res;
          expect(body.error).to.be.equal('Bad Request');
          done();
        });
    });
  });
});
