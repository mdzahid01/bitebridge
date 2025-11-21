import { Router } from "express";
import {login, me, signup} from '../controllers/auth.controller.js'
import { uploadAvatar } from "../middlewares/multer.middleware.js";
import protectedRoute from "../middlewares/auth.middleware.js";


const router = Router();

router.post('/signup', uploadAvatar.single('profileImage'),signup)
router.post('/login',login)
router.get('/me', protectedRoute,me)

export default router