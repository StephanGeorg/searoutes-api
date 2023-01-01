import { expect } from 'chai';

import userService from '../../src/services/users';

describe('User Service', () => {
  describe('User Service', () => {
    it('should return a list of users', (done) => {
      userService.listUsers()
        .then((users) => {
          expect(users[0].id).to.be.equal(1);
          expect(users[0].name).to.be.equal('tom');
          done();
        })
        .catch(done);
    });

    it('should return user with id 1', (done) => {
      userService.getUser(1)
        .then((user) => {
          expect(user.id).to.be.equal(1);
          expect(user.name).to.be.equal('tom');
          done();
        })
        .catch(done);
    });

    it('should add a user', (done) => {
      userService.createUser({
        name: 'jim',
        id: 4,
      })
        .then(() => {
          userService.listUsers()
            .then((users) => {
              expect(users.length).to.be.equal(4);
              done();
            });
        })
        .catch(done);
    });
  });
});
