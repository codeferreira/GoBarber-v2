import User from '../models/User';
import File from '../models/File';

import Cache from '../../lib/Cache';

class ProviderController {
  async index(request, response) {
    const cached = await Cache.get('providers');

    if (cached) {
      return response.json(cached);
    }

    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });

    if (!providers.length) {
      return response.json({ error: 'There is no provider.' });
    }

    await Cache.set('providers', providers);

    return response.json(providers);
  }
}

export default new ProviderController();
