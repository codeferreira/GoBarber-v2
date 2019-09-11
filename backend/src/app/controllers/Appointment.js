import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(request, response) {
    const { page = 1 } = request.query;

    const appointments = await Appointment.findAll({
      where: { user_id: request.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
          ],
        },
      ],
    });

    return response.json(appointments);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    const isSchemaValid = await schema.validate(request.body);

    if (!isSchemaValid) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = request.body;

    const provider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!provider) {
      return response
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    if (request.userId === provider.id) {
      return response
        .status(401)
        .json({ error: 'You can not make a appointment with yourself' });
    }

    const hourStart = startOfHour(parseISO(date));

    const datePassed = isBefore(hourStart, new Date());

    if (datePassed) {
      return response.status(400).json({ error: 'Past dates are not allowed' });
    }

    const checkFeasibility = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkFeasibility) {
      return response
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await Appointment.create({
      user_id: request.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(request.userId);
    const formatedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' HH:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return response.json(appointment);
  }

  async delete(request, response) {
    const { id: appointmentId } = request.params;
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'provider', attributes: ['email', 'name'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    if (appointment.user_id !== request.userId) {
      return response.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return response.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance.',
      });
    }
    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return response.json();
  }
}

export default new AppointmentController();
