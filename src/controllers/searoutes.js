import { Joi, Segments } from 'celebrate';
import HTTPStatus from 'http-status';

import SeaRoutesService from '../services/searoutes';

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
    getRoute: {
      [Segments.PARAMS]: {
        startPoint: Joi.string().required(),
        endPoint: Joi.string().required(),
      },
      [Segments.QUERY]: {
        path: Joi.bool(),
      },
    },
  },

  /**
   *  Get shortest sea route between two points
   */
  async getShortestRoute(req, res, next) {
    const { startPoint, endPoint } = req.params;
    const { path } = req.query;
    const startCoord = startPoint.split(',');
    const endCoord = endPoint.split(',');
    try {
      const seaRoute = await SeaRoutesService.getShortestRoute(startCoord, endCoord, path);
      if (!seaRoute) throw errors.default;
      res.json(seaRoute);
    } catch (error) {
      next(extendError(
        error,
        { task: 'SeaRoutes/getShortestRoute', context: { startPoint, endPoint } },
      ));
    }
  },
};
