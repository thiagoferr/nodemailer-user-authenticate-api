import express from 'express'
import authController from '../controllers/authController';
import passwordController from '../controllers/passwordController';
import userController from '../controllers/userController'
import { validateToken } from '../middlewares/authToken';

const authToken = validateToken.function;
const routes = express.Router();

// crud routes
routes.get('/users', userController.listAll);
routes.get('/users/:email', userController.listByMail);
routes.get('/users/:id', userController.listById);
routes.post('/register', userController.register);
routes.put('/users/:id',  userController.update);
routes.delete('/users/:id', authToken, userController.delete);

// password controller
routes.post('/users/forget-password', passwordController.forgetPassword)
routes.get('/users/reset-password/:id/:token', authToken, passwordController.resetPassword);
routes.post('/users/reset-password/:id', authToken, passwordController.resetPassword);

// authentication controller
routes.post('/auth',  authController.authUser);






export default routes