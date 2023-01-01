import { Joi } from 'celebrate';
import find from 'lodash.find';
import findIndex from 'lodash.findindex';
import HTTPStatus from 'http-status';

import ExtError from '../utils/error/error';

const users = [
  {
    id: 1,
    name: 'tom',
  },
  {
    id: 2,
    name: 'jim',
  },
];

export default {
  /**
   *  User schema
   */
  schema: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(2).required(),
    email: Joi.string().email(),
  }),

  /**
   *  List all available users
   */
  async getUsers() { return users; },

  /**
   *  Get a particular user
   */
  async getUser(id = '') {
    const user = find(users, { id: Number(id) });
    return user;
  },

  /**
   *  Creating a new user
   */
  async createUser(user = {}) {
    const userToCreate = {
      id: Number((Math.random() * 1000000).toFixed(0)),
      ...user,
    };
    await this.schema.validate(userToCreate); // Throws if validation fails
    users.push(userToCreate);
    return user;
  },

  /**
   *  Update a particular user
   */
  async updateUser(userId, update = {}) {
    const user = await this.getUser(userId);
    if (!user) throw new ExtError('User not found!', { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' });
    const userToUpdate = Object.assign(user, update);
    await this.schema.validate(userToUpdate);
    const userIndex = findIndex(user, { id: userId });
    if (userIndex !== -1) users[userIndex] = userToUpdate;
  },
};
