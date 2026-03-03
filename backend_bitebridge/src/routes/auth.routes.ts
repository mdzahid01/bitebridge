import { Router } from "express";
import {login, logout, me, signup} from '../controllers/auth.controller.js'
import { uploadAvatar } from "../middlewares/multer.middleware.js";
import protectedRoute from "../middlewares/auth.middleware.js";
import { multerErrorHandler } from "../middlewares/multer.middleware.js";


const router = Router();

router.post('/signup', uploadAvatar.single('profileImage'),multerErrorHandler,signup)
router.post('/login',login)
router.post('/logout',logout)
router.get('/me', protectedRoute,me)

export default router