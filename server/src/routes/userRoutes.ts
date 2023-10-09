import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/register', userController.register);
router.get('/user', userController.getUser);
router.put('/user', userController.updateUser);
router.get('/isUserRegistered', userController.isUserRegistered);
router.get('/isUserInGroup', userController.isUserInGroup);
router.get('/getUserGroup', userController.getUserGroup);

export default router;
