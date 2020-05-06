import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import DeliveryProblem from '../models/DeliveryProblem';
import Deliveryman from '../models/Deliveryman';

import Queue from '../../lib/queue';
import CancellationMail from '../jobs/CancellationMail';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string()
        .min(5)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });

      return res.status(400).json({ errors });
    }

    const { order_id } = req.params;

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(400).json({ error: 'This order does not exists' });
    }
    if (order.end_date) {
      return res
        .status(400)
        .json({ error: 'This order has already been deliveried' });
    }
    const delivery_id = Number(order_id);

    const { description } = req.body;

    const problem = await DeliveryProblem.create({
      description,
      delivery_id,
    });

    return res.json(problem);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;
    const ordersWithDeliveryProblems = await DeliveryProblem.findAll({
      limit: pageLimit,
      offset: (page - 1) * 5,
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'recipient_id',
            'start_date',
            'end_date',
            'canceled_at',
          ],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'zip'],
            },
          ],
        },
      ],
    });

    const totalPages = await DeliveryProblem.findAndCountAll();

    res.header('currentPage', page);
    res.header('pages', Math.ceil(totalPages.count / pageLimit));

    return res.json(ordersWithDeliveryProblems);
  }

  async show(req, res) {
    const { order_id } = req.params;

    const deliveryProblems = await DeliveryProblem.findAll({
      where: { delivery_id: order_id },
      attributes: ['id', 'delivery_id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['id', 'name', 'street', 'number', 'city', 'state'],
            },
          ],
        },
      ],
    });
    return res.json(deliveryProblems);
  }

  async delete(req, res) {
    const { problem_id } = req.params;

    const orderWithProblem = await DeliveryProblem.findByPk(problem_id);
    if (!orderWithProblem) {
      return res
        .status(400)
        .json({ error: 'There is no problem with that specific id' });
    }
    const { delivery_id } = orderWithProblem;

    const order = await Order.findByPk(delivery_id, {
      attributes: [
        'id',
        'product',
        'start_date',
        'canceled_at',
        'deliveryman_id',
        'recipient_id',
      ],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['street', 'number', 'city', 'state', 'zip'],
        },
      ],
    });
    if (order.canceled_at !== null) {
      return res
        .status(400)
        .json({ error: 'This order has already been canceled' });
    }

    const cancelledDate = new Date().toJSON();

    order.canceled_at = cancelledDate;

    await order.save();

    await Queue.add(CancellationMail.key, {
      order,
    });
    return res.json(order);
  }
}
export default new DeliveryProblemController();
