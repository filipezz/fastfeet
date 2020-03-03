import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO, isAfter } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Order from '../models/Order';

class DeliveryStatusController {
  async index(req, res) {
    const { deliveryman_id } = req.params;
    const { deliveried } = req.query;

    let whereStatement = {};

    if (deliveried === 'false') {
      whereStatement = {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
      };
    } else if (deliveried === 'true') {
      whereStatement = {
        deliveryman_id,
        canceled_at: null,
        end_date: {
          [Op.ne]: null,
        },
      };
    } else {
      whereStatement = {
        deliveryman_id,
        canceled_at: null,
      };
    }
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }
    const deliveries = await Order.findAll({
      where: whereStatement,
      attributes: [
        'id',
        'product',
        'signature_id',
        'start_date',
        'end_date',
        'recipient_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip',
          ],
        },
      ],
      order: [['id', 'DESC']],
    });
    if (deliveries.length === 0) {
      return res.json({ error: 'No orders deliveried yet' });
    }
    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
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

    const order = await Order.findByPk(order_id, {
      attributes: ['id', 'product', 'start_date', 'recipient_id'],
    });

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

    const { start_date } = req.body;
    const startDate = parseISO(start_date);

    if (order.start_date !== null) {
      return res
        .status(400)
        .json({ error: 'The deliveryman already withdrawn this order' });
    }
    if (isAfter(startDate, new Date())) {
      return res
        .status(400)
        .json({ error: 'The withdrawn cant be set in the future' });
    }
    const maxOrdersPerDay = await Order.findAndCountAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(startDate), endOfDay(startDate)],
        },
        canceled_at: null,
      },
    });

    if (maxOrdersPerDay.count > 5) {
      return res
        .status(401)
        .json({ error: 'You achieved the daily withdraw limit' });
    }

    await order.update({
      start_date: startDate,
    });

    return res.json(order);
  }
}

export default new DeliveryStatusController();
