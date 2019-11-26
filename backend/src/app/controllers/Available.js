import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(request, response) {
    const { date } = request.query;

    if (!date) {
      return response.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);

    const available = await AvailableService.run({
      date: searchDate,
      provider_id: request.params.providerId,
    });

    return response.json(available);
  }
}

export default new AvailableController();
