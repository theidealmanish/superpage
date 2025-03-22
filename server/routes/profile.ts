import express from 'express';
import { createProfile, getProfileByUserId } from '../controllers/profile';

const router = express.Router();

router.post('/', createProfile);
router.post('/:userId', getProfileByUserId);

export default router;
