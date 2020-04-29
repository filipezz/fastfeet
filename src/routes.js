import { Router } from 'express';
import multer from 'multer';

import authMiddleware from './middlewares/auth';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliveryStatusController from './app/controllers/DeliveryStatusController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ hello: 'world' });
});

routes.post('/users', SessionController.store);

routes.post('/signature', upload.single('signature'), FileController.store);
routes.get('/deliverymen/:deliveryman_id', DeliveryStatusController.index);
routes.put(
  '/deliveryman/:deliveryman_id/order/:order_id',
  DeliveryStatusController.update
);
routes.put(
  '/deliveryman/:deliveryman_id/order/:order_id/end_delivery',
  EndDeliveryController.update
);

routes.post('/deliveries/:order_id/problems', DeliveryProblemController.store);
routes.get('/deliveries/problems', DeliveryProblemController.index);
routes.get('/deliveries/:order_id/problems', DeliveryProblemController.show);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.get('/recipient/:id', RecipientController.show);
routes.delete('/recipient/:id', RecipientController.delete);
routes.put('/recipient/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliveryman', DeliverymanController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.get('/deliveryman/:id', DeliverymanController.show);
routes.delete('/deliveryman/:id', DeliverymanController.delete);
routes.put('/deliveryman/:id', DeliverymanController.update);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.get('/orders/:order_id', OrderController.show);
routes.delete('/orders/:order_id', OrderController.delete);
routes.put('/orders/:order_id', OrderController.update);

routes.delete(
  '/deliveries/problem/:problem_id/cancel',
  DeliveryProblemController.delete
);

export default routes;
