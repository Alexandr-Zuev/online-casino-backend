import express from 'express';
import { playRoulette } from '../controllers/playRoulette.js';
import { playSlots } from '../controllers/playSlots.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Роуты для игр
router.post('/roulette/play', protect, playRoulette);
router.post('/slots/play', protect, playSlots);

export default router;