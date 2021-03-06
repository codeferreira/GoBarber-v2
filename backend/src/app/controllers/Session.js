import jwt from 'jsonwebtoken';
import User from '../models/User';
import File from '../models/File';

import authConfig from '../../config/auth';

class SessionController {
  async store(request, response) {
    const { email, password } = request.body;
    const { secret, expiresIn } = authConfig;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    if (!user) {
      return response.status(400).json({ error: 'User does not exists.' });
    }

    const correctPassword = await user.checkPassword(password);

    if (!correctPassword) {
      return response.status(401).json({ error: 'Password incorrect.' });
    }

    const { id, name, avatar, provider } = user;
    const token = jwt.sign({ id }, secret, {
      expiresIn,
    });

    return response.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider,
      },
      token,
    });
  }
}

export default new SessionController();
