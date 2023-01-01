import { Joi, Segments } from 'celebrate';
import HTTPStatus from 'http-status';

import UsersService from '../services/users';

import ExtError, { extendError } from '../utils/error/error';

const errors = {
  default: new ExtError(
    'User not found!',
    { statusCode: HTTPStatus.NOT_FOUND, logType: 'warn' },
  ),
};

export default {
  /** Request validations */
  validate: {
    getUser: {
      [Segments.PARAMS]: {
        userId: Joi.string().required(),
      },
    },
    createUser: {
      [Segments.BODY]: {
        name: Joi.string().required(),
        email: Joi.string().email(),
      },
    },
    updateUser: {
      [Segments.BODY]: {
        name: Joi.string().required(),
        email: Joi.string().email(),
      },
    },
  },

  /**
   *  List all available users
   */
  async listUsers(req, res, next) {
    try {
      const users = await UsersService.listUsers();
      if (!users) throw errors.default;
      res.json(users);
    } catch (error) {
      next(extendError(
        error,
        { task: 'Users/listUsers' },
      ));
    }
  },

  /**
   *  Get a particular user
   */
  async getUser(req, res, next) {
    const { userId } = req.params;
    try {
      const user = await UsersService.getUser(userId);
      if (!user) throw errors.default;
      res.json(user);
    } catch (error) {
      next(extendError(
        error,
        { task: 'Users/getUser', context: { userId } },
      ));
    }
  },

  /**
   *  Create a new user
   */
  async createUser(req, res, next) {
    const { body } = req;
    try {
      await UsersService.createUser({ ...body });
      res.status(HTTPStatus.CREATED);
      res.json({ success: true });
    } catch (error) {
      next(extendError(
        error,
        { task: 'Users/createUser', context: { body } },
      ));
    }
  },

  /**
   *  Create a new user
   */
  async updateUser(req, res, next) {
    const { userId } = req.params;
    const { body } = req;
    try {
      await UsersService.updateUser(userId, { ...body });
      res.status(HTTPStatus.NO_CONTENT);
      res.json({ success: true });
    } catch (error) {
      next(extendError(
        error,
        { task: 'Users/updateUser', context: { body } },
      ));
    }
  },
};
