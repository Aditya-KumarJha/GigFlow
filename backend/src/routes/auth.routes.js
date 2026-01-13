import express from 'express';
import passport from '../config/passport.js';
import {
	registerUser,
	verifyRegisterOTP,
	resendOTP,
	loginUser,
	verifyLoginOTP,
	oauthCallback,
	forgotPassword,
	verifyForgotPasswordOTP,
	resetPassword,
	logout,
	getCurrentUser,
	updateProfile,
} from '../controllers/auth.controller.js';
import {
	registerUserValidations,
	verifyOTPValidations,
	resendOTPValidations,
	loginUserValidations,
	verifyLoginOTPValidations,
	forgotPasswordValidations,
	verifyForgotPasswordOTPValidations,
	resetPasswordValidations,
	updateProfileValidations,
} from '../validators/auth.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Registration Flow
router.post('/register', registerUserValidations, registerUser);

router.post('/verify-register-otp', verifyOTPValidations, verifyRegisterOTP);

router.post('/resend-otp', resendOTPValidations, resendOTP);

// Login Flow
router.post('/login', loginUserValidations, loginUser);

router.post('/verify-login-otp', verifyLoginOTPValidations, verifyLoginOTP);

// Forgot Password Flow
router.post('/forgot-password', forgotPasswordValidations, forgotPassword);

router.post('/verify-forgot-password-otp', verifyForgotPasswordOTPValidations, verifyForgotPasswordOTP);

router.post('/reset-password', resetPasswordValidations, resetPassword);

router.get('/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt: 'select_account',
		state: 'login',
	})
);
router.get('/google/signup',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt: 'select_account',
		state: 'signup',
	})
);
router.get(
	'/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/api/auth/oauth-failure?provider=google',
		session: false,
	}),
	oauthCallback('google')
);

router.get('/github',
	passport.authenticate('github', {
		scope: ['user:email'],
		state: 'login',
	})
);
router.get('/github/signup',
	passport.authenticate('github', {
		scope: ['user:email'],
		state: 'signup',
	})
);
router.get(
	'/github/callback',
	passport.authenticate('github', {
		failureRedirect: '/api/auth/oauth-failure?provider=github',
		session: false,
	}),
	oauthCallback('github')
);

router.get('/oauth-failure', (req, res) => {
	const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
	const provider = (req.query.provider || '').toLowerCase();
	let message = req.query.error || 'OAuth authentication failed';

	if (provider === 'github') {
		message =
			'No GitHub account found for this user. If you registered using Google or email/password, try logging in with that method or sign up with GitHub.';
	} else if (provider === 'google') {
		message =
			'No Google account found for this user. If you registered using GitHub or email/password, try logging in with that method or sign up with Google.';
	}

	return res.redirect(`${frontend}/login?error=${encodeURIComponent(message)}`);
});

// Logout
router.post('/logout', logout);

// Get Current User
router.get('/me', authMiddleware, getCurrentUser);

// Update Profile
router.patch('/profile', authMiddleware, uploadSingle, updateProfileValidations, updateProfile);

export default router;
