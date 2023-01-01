import express from 'express';
import { celebrate } from 'celebrate';

import SeaRoutesController from '../../controllers/searoutes';

const router = express.Router({
  mergeParams: true,
});

/**
 *  Get user by id
 */
router.get(
  '/shortest/:startPoint/:endPoint',
  celebrate(SeaRoutesController.validate.getRoute),
  SeaRoutesController.getShortestRoute,
);

export default router;
