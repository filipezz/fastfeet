import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import authMiddleware from './middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ hello: 'world' });
});
routes.post('/users', SessionController.store);
routes.use(authMiddleware);
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.get('/recipient/:id', RecipientController.show);
routes.delete('/recipient/:id', RecipientController.delete);
routes.put('/recipient/:id', RecipientController.update);

export default routes;
