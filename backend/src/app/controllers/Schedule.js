import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class Schedule {
  async index(request, response) {
    const isUserProvider = await User.findOne({
      where: { id: request.userId, provider: true },
    });

    if (!isUserProvider) {
      return response.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = request.query;
    const parsedDate = parseISO(date);

    const schedule = await Appointment.findAll({
      where: {
        provider_id: request.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return response.json(schedule);
  }
}

export default new Schedule();
