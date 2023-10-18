import express from 'express';
import * as menuController from '../controllers/menuController';

const router = express.Router();

router.get('/menu', menuController.getMenu);
router.get('/lieux', menuController.getLieux);
router.get('/horaires', menuController.getHoraires);

export default router;
