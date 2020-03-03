import * as Yup from 'yup';

import { parseISO, isBefore, isAfter } from 'date-fns';

import Deliveryman from '../models/Deliveryman';

import File from '../models/File';
import Order from '../models/Order';

class EndDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });

      return res.status(400).json({ errors });
    }

    const { order_id, deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const deliveryBelongsToDeliveryman = await Order.findOne({
      where: { id: order_id, deliveryman_id },
    });

    if (!deliveryBelongsToDeliveryman) {
      return res.status(401).json({
        error: 'This order does not belogs to this deliveryman',
      });
    }
    const { end_date } = req.body;
    const { start_date } = order;
    const endDate = parseISO(end_date);
    const startDate = parseISO(start_date);
    const { signature_id } = req.body;

    if (order.start_date !== null) {
      return res
        .status(400)
        .json({ error: 'The deliveryman already withdrawn this order' });
    }

    if (!start_date) {
      return res
        .status(400)
        .json({ error: 'The deliveryman hasnt withdrawn this order yet' });
    }
    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(400).json({ error: 'Wrong signature id' });
    }
    if (isBefore(endDate, startDate)) {
      return res
        .status(400)
        .json({ error: 'End date cant be before Start date' });
    }
    if (isAfter(endDate, new Date())) {
      return res.status(400).json({ error: 'End date cant be in the future' });
    }
    await order.update({
      end_date: endDate,
      signature_id,
    });

    return res.json(order);
  }
}

export default new EndDeliveryController();
