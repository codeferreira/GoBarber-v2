import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Appointment from '../models/Appointment';

import Notification from '../schemas/Notification';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    const provider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!provider) {
      throw new Error('You can only create appointments with providers');
    }

    if (user_id === provider.id) {
      throw new Error('You can not make a appointment with yourself');
    }

    const hourStart = startOfHour(parseISO(date));

    const datePassed = isBefore(hourStart, new Date());

    if (datePassed) {
      throw new Error('Past dates are not allowed');
    }

    const checkFeasibility = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkFeasibility) {
      throw new Error('Appointment date is not available');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    const user = await User.findByPk(user_id);
    const formatedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' HH:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return appointment;
  }
}

export default new CreateAppointmentService();
