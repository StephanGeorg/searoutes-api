import express from 'express';
import { celebrate } from 'celebrate';

import usersController from '../../controllers/users';

const router = express.Router({
  mergeParams: true,
});

/**
 *  List all users
 */
router.get(
  '/list',
  usersController.listUsers,
);

/**
 *  Get user by id
 */
router.get(
  '/get/:userId',
  celebrate(usersController.validate.getUser),
  usersController.getUser,
);

/**
 *  Create a new user
 */
router.post(
  '/create',
  celebrate(usersController.validate.createUser),
  usersController.createUser,
);

/**
 *  Update a particular user
 */
router.patch(
  '/update/:userId',
  celebrate(usersController.validate.updateUser),
  usersController.updateUser,
);

export default router;
