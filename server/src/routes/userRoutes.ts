import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/register', userController.register);
router.get('/user', userController.getUser);
router.get('/isUserRegistered', userController.isUserRegistered);

// ... Autres routes pour les utilisateurs ...

export default router;