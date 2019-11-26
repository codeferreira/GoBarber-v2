import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

class AppointmentController {
  async index(request, response) {
    const { page = 1 } = request.query;

    const appointments = await Appointment.findAll({
      where: { user_id: request.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
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
    const { provider_id, date } = request.body;

    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: request.userId,
      date,
    });

    return response.json(appointment);
  }

  async delete(request, response) {
    await CancelAppointmentService.run({
      appointment_id: request.params.id,
      user_id: request.userId,
    });

    return response.json();
  }
}

export default new AppointmentController();
