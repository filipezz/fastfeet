import * as Yup from 'yup';

import { Op } from 'sequelize';

import Order from '../models/Order';
import File from '../models/File';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Queue from '../../lib/queue';
import CancellationMail from '../jobs/CancellationMail';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });

      return res.status(400).json({ errors });
    }
    const { product, recipient_id, deliveryman_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman does not exists' });
    }
    const recipient = await Recipient.findByPk(recipient_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient does not exists' });
    }

    const order = await Order.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    return res.json(order);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;

    if (req.query.q) {
      const { q } = req.query;
      const orders = await Order.findAll({
        limit: pageLimit,
        offset: (page - 1) * 5,
        where: {
          product: {
            [Op.iLike]: `%${q}%`,
          },
        },
        order: [['id', 'DESC']],
        attributes: [
          'id',
          'product',
          'signature_id',
          'deliveryman_id',
          'recipient_id',
          'start_date',
          'end_date',
          'canceled_at',
          'past',
        ],
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['name', 'street', 'city', 'state', 'zip'],
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['name', 'avatar_id', 'email'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['path', 'url'],
              },
            ],
          },
        ],
      });
      const totalPages = orders.length;

      res.header('currentPage', page);
      res.header('pages', Math.ceil(totalPages / pageLimit));

      return res.json(orders);
    }

    const orders = await Order.findAll({
      order: [['id', 'DESC']],
      limit: pageLimit,
      offset: (page - 1) * 5,
      attributes: [
        'id',
        'product',
        'signature_id',
        'deliveryman_id',
        'recipient_id',
        'start_date',
        'end_date',
        'canceled_at',
        'past',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'city', 'state', 'zip'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'avatar_id', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });
    const totalPages = await Order.findAndCountAll();

    res.header('currentPage', page);
    res.header('pages', Math.ceil(totalPages.count / pageLimit));

    return res.json(orders);
  }

  async show(req, res) {
    const { order_id } = req.params;

    const orders = await Order.findByPk(order_id, {
      order: [['id', 'DESC']],
      attributes: [
        'id',
        'product',
        'signature_id',
        'deliveryman_id',
        'recipient_id',
        'start_date',
        'end_date',
        'canceled_at',
        'past',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'street', 'city', 'state', 'zip'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'avatar_id', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });
    if (!orders) {
      return res.status(404).json({ error: 'Order does not exists' });
    }
    return res.json(orders);
  }

  async delete(req, res) {
    const { order_id } = req.params;
    const order = await Order.findByPk(order_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'city', 'state', 'zip'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order does not exists' });
    }

    if (!((await order.canceled_at) === null)) {
      return res
        .status(400)
        .json({ error: 'This order has already been canceled' });
    }

    await Queue.add(CancellationMail.key, {
      order,
    });
    await order.destroy();

    return res.status(200).json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
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

    const order = await Order.findByPk(order_id, {
      attributes: ['id', 'product', 'deliveryman_id', 'recipient_id'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'avatar_id', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order does not exists' });
    }
    if ((await order.canceled_at) === null) {
      return res
        .status(400)
        .json({ error: 'This order has already been canceled' });
    }
    const { deliveryman_id, recipient_id } = req.body;
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman does not exists' });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient does not exists' });
    }

    await order.update(req.body);
    return res.json(order);
  }
}

export default new OrderController();
