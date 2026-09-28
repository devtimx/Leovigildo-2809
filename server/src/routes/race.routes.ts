import { Router } from 'express';
import raceController from '../controllers/race.controller.js';

const router = Router();

router.get('/', async (req, res, next) => {
  await raceController.getAllRaces(req, res, next);
});

export default router;
