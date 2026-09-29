import { Request, Response, NextFunction } from 'express';
import raceRepository from '../repositories/race.repository.js';
import raceService from '../services/race.service.js';

class RaceController {
  async getAllRaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const races = await raceRepository.readAll();
      const competitors = raceService.getCompetitors();
      res.status(200).json(races.map(race => ({ ...race, competitors })));
    } catch (error) {
      next(error);
    }
  }
}

export default new RaceController();
