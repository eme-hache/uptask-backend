import express from 'express'

import checkAuth from '../middleware/checkAuth.js'
import { 
    forgotPassword, 
    resetPassword,
    confirmUser,
    checkToken,
    profile,
    signUp, 
    signIn,
} from '../controllers/user.controller.js'

const router = express.Router()

// Public routes
router.get('/confirm/:token', confirmUser)
router.get('/check-token/:token', checkToken)

router.post('/', signUp)
router.post('/login', signIn)
router.post('/forgot-password', forgotPassword)
router.post('/forgot-password/:token', resetPassword)

// Private routes
router.get('/profile', checkAuth, profile)

export default router