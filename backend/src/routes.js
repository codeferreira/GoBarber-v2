import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/User';
import SessionController from './app/controllers/Session';
import FileController from './app/controllers/File';
import ProviderController from './app/controllers/Provider';
import AppointmentController from './app/controllers/Appointment';
import NotificationController from './app/controllers/Notification';
import ScheduleController from './app/controllers/Schedule';
import AvailableController from './app/controllers/Available';

import validateUserStore from './app/validators/User/store';
import validateUserUpdate from './app/validators/User/update';
import validateSessionStore from './app/validators/Session/store';
import validateAppointmentStore from './app/validators/Appointment/store';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', validateUserStore, UserController.store);
routes.post('/sessions', validateSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.put('/users', validateUserUpdate, UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.get('/appointments', AppointmentController.index);
routes.post(
  '/appointments',
  validateAppointmentStore,
  AppointmentController.store
);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedules', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
