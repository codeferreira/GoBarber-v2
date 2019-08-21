import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import Appointment from '../models/Appointment';

class AppointmentController {
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

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return response
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
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

    return response.json(appointment);
  }
}

export default new AppointmentController();
