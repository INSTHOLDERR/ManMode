import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import { isLogin, isNotLogin } from '../middlewares/authentication.js';

// Google auth route
router.get('/auth/google', isLogin, authController.googleAuth);

// Google auth callback route
router.get('/auth/google/callback', isLogin, authController.googleAuthCallback);

export default router;
