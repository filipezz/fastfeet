import * as Yup from 'yup';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(3),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => {
          return err.errors;
        });
      return res.status(400).json(errors);
    }
    const recipient = await Recipient.create(req.body);
    return res.json(recipient);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;
    if (req.query.q) {
      const { q } = req.query;

      const recipients = await Recipient.findAll({
        order: [['id', 'DESC']],

        limit: pageLimit,
        offset: (page - 1) * 5,
        where: {
          name: {
            [Op.iLike]: `%${q}%`,
          },
        },
      });
      const totalPages = recipients.length;

      res.header('currentPage', page);
      res.header('pages', Math.ceil(totalPages / pageLimit));
      return res.json(recipients);
    }
    const recipients = await Recipient.findAll({
      order: [['id', 'DESC']],

      limit: pageLimit,
      offset: (page - 1) * 5,
    });
    const totalPages = await Recipient.findAndCountAll();

    res.header('currentPage', page);
    res.header('pages', Math.ceil(totalPages.count / pageLimit));

    return res.json(recipients);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zip: Yup.string().when(['rua', 'numero', 'estado', 'cidade'], {
        is: (rua, numero, estado, cidade) =>
          rua || numero || estado || cidade === true,
        then: Yup.string().required(),
        otherwise: Yup.string(),
      }),
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

    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      res.status(400).json({ error: 'User does not exists' });
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    } = await recipient.update(req.body);

    return res.json({
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    await Recipient.destroy({ where: { id } });
    res.json({
      message: `Recipient with id ${id} has been deleted successfully`,
    });
  }

  async show(req, res) {
    const { id } = req.params;
    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    } = await Recipient.findByPk(id);
    return res.json({
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    });
  }
}

export default new RecipientController();
