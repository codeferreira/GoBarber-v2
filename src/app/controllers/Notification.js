import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(request, response) {
    const isProvider = await User.findOne({
      where: { id: request.userId, provider: true },
    });

    if (!isProvider) {
      return response
        .status(401)
        .json({ error: 'Only providers can load notification' });
    }
    console.log('provider id: ', request.userId);
    const notifications = await Notification.find({
      user: request.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return response.json(notifications);
  }

  async update(request, response) {
    return response.json({});
  }
}

export default new NotificationController();
