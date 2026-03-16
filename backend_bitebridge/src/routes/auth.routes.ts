import { Router } from "express";
import {login, logout, me, signup, updateUserProfile} from '../controllers/auth.controller.js'
import { uploadAvatar } from "../middlewares/multer.middleware.js";
import protectedRoute from "../middlewares/auth.middleware.js";
import { multerErrorHandler } from "../middlewares/multer.middleware.js";


const router = Router();

router.post('/signup', uploadAvatar.single('profileImage'),multerErrorHandler,signup)
router.post('/login',login)
router.post('/logout',logout)
router.get('/me', protectedRoute,me)
router.put('/profile', protectedRoute, uploadAvatar.single('profileImage'), multerErrorHandler, updateUserProfile)

export default router