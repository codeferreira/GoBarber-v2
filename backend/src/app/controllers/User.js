import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(request, response) {
    const userExists = await User.findOne({
      where: { email: request.body.email },
    });

    if (userExists) {
      return response.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(request.body);

    return response.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(request, response) {
    const { email, oldPassword } = request.body;

    const user = await User.findByPk(request.userId);

    if (email !== user.email) {
      const emailInUse = await User.findOne({ where: { email } });

      if (emailInUse) {
        return response.status(400).json({ error: 'Email already in use.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response.status(401).json({ error: 'Password incorrect.' });
    }

    await user.update(request.body);

    const { id, name, avatar } = await User.findByPk(request.userId, {
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    return response.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
