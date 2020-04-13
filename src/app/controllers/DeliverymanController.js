import * as Yup from 'yup';

import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymenController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(3),
      email: Yup.string()
        .required()
        .email(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });
      return res.status(400).json(errors);
    }
    const deliverymanExtists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });
    if (deliverymanExtists) {
      return res.status(400).json({ error: 'Deliveryman already registered' });
    }
    const { name, email, avatar_id } = req.body;
    const avatar = await File.findByPk(avatar_id);
    if (avatar) {
      return res
        .status(400)
        .json({ error: 'This profile picture is already being used' });
    }
    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });
    return res.json(deliveryman);
  }

  async index(req, res) {
    if (req.query.q) {
      const { q } = req.query;
      const deliverymen = await Deliveryman.findAll({
        where: {
          name: {
            [Op.iLike]: `%${q}%`,
          },
        },
        attributes: ['id', 'name', 'email', 'avatar_id'],
        include: [
          { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
        ],
      });
      return res.json(deliverymen);
    }
    const deliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    return res.json(deliverymen);
  }

  async delete(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res
        .status(400)
        .json({ error: `User with id=${id} does not exists` });
    }
    deliveryman.destroy({ where: { id } });
    return res.json({ message: `User with id = ${id} deleted successfully` });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });
      return res.status(400).json(errors);
    }

    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    if (!deliveryman) {
      return res.status(400).json({ error: 'User does not exists' });
    }
    await deliveryman.update(req.body);
    await deliveryman.save();
    return res.json(deliveryman);
  }
}

export default new DeliverymenController();
