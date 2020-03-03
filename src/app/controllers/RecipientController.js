import * as Yup from 'yup';
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
      state: Yup.string()
        .length(2)
        .required(),
      city: Yup.string().required(),
      zip: Yup.string()
        .required()
        .length(8),
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
    const recipients = await Recipient.findAll();
    return res.json(recipients);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string().length(2),
      city: Yup.string(),
      zip: Yup.string()
        .length(8)
        .when(['rua', 'numero', 'estado', 'cidade'], {
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
