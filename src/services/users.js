import HTTPStatus from 'http-status';

import Users from '../models/users';
import ExtError from '../utils/error/error';

export default {
  listUsers() {
    return Users.getUsers();
  },

  getUser(id = '') {
    return Users.getUser(id);
  },

  /**
   *  Create a new user
   */
  createUser(user = {}) {
    return Users.createUser(user);
  },

  /**
   *  Update a particular user
   */
  async updateUser(userId, update = {}) {
    const user = await Users.getUser(userId);
    if (!user) throw new ExtError('User not found!', { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' });
    return Users.updateUser(userId, update);
  },


};
