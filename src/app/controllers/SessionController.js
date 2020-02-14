import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      const errors = await schema
        .validate(req.body, { abortEarly: false })
        .catch(err => err.errors);
      return res.status(400).json({ errors });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User does not exists' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const { id, name, is_admin } = user;
    if (!is_admin) {
      return res.status(401).json({ error: 'User is not an administrator' });
    }
    return res.json({
      id,
      name,
      email,
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}
export default new SessionController();
