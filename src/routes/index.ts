import express from 'express'
import userController from '../controllers/userController'
import { validateToken } from '../middlewares/authToken';
const authToken = validateToken.function;
const routes = express.Router();

routes.get('/users', userController.listAll);
routes.get('/users/:email', userController.listByMail);
routes.get('/users/:id', userController.listById);

routes.post('/register', userController.register);
routes.post('/auth',  userController.authUser);
routes.post('/users/forget-password', userController.forgetPassword)
routes.get('/users/reset-password/:id/:token', authToken, userController.resetPassword);
routes.post('/users/reset-password/:id', authToken, userController.resetPassword);

routes.put('/users/:id',  userController.update);
routes.delete('/users/:id',  userController.delete);



export default routes