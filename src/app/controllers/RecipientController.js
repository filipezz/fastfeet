import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(3),
      rua: Yup.string().required(),
      numero: Yup.string().required(),
      complemento: Yup.string(),
      estado: Yup.string()
        .length(2)
        .required(),
      cidade: Yup.string().required(),
      cep: Yup.string()
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
      rua: Yup.string(),
      numero: Yup.string(),
      complemento: Yup.string(),
      estado: Yup.string().length(2),
      cidade: Yup.string(),
      cep: Yup.string()
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
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep,
    } = await recipient.update(req.body);

    return res.json({
      name,
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep,
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
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep,
    } = await Recipient.findByPk(id);
    return res.json({
      name,
      rua,
      numero,
      complemento,
      estado,
      cidade,
      cep,
    });
  }
}

export default new RecipientController();
