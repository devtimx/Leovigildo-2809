import { Request, Response, NextFunction } from 'express';
import raceRepository from '../repositories/race.repository.js';

class RaceController {
  async getAllRaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const races = await raceRepository.readAll();
      res.status(200).json(races);
    } catch (error) {
      next(error);
    }
  }
}

export default new RaceController();
