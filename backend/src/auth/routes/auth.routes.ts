import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';
import { IAuthController } from '../controller/i-auth.controller.js';
import { UserValidator } from '../../middlewares/validators/user-validator.js';

export const configureAuthRoutes = (
  controller: IAuthController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.post('/register', UserValidator.validateCreate(), (req, res) =>
    controller.register(req, res),
  );

  router.post('/login', (req, res) => controller.login(req, res));

  router.post(
    '/password/change',
    authMiddleware.authenticate,
    UserValidator.validatePasswordChange(),
    (req, res) => controller.changePassword(req, res),
  );

  return router;
};
