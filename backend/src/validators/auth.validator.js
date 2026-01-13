import { body, validationResult } from 'express-validator';

const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const registerUserValidations = [
    body("email")
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    body("fullName")
        .optional()
        .custom((value) => {
            if (typeof value !== 'object' || value === null) {
                throw new Error("Full name must be an object with firstName and lastName");
            }
            if (typeof value.firstName !== 'string' || value.firstName.trim().length === 0) {
                throw new Error("firstName must be a non-empty string");
            }
            if (typeof value.lastName !== 'string' || value.lastName.trim().length === 0) {
                throw new Error("lastName must be a non-empty string");
            }
            return true;
        }),
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    body("provider")
        .optional()
        .isIn(['email', 'google', 'github'])
        .withMessage("Provider must be 'email', 'google', or 'github'"),
    (req, res, next) => {
        if (req.body.provider === 'email' && !req.body.password) {
            return res.status(400).json({ 
                errors: [{ msg: 'Password is required for email registration' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    }
];

export const verifyOTPValidations = [
    body("email")
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("otp")
        .isString()
        .withMessage("OTP must be a string")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be exactly 6 characters")
        .trim(),
    respondWithValidationErrors
];

export const resendOTPValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    }
];

export const loginUserValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    },
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];

export const verifyLoginOTPValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    },
    body("otp")
        .isString()
        .withMessage("OTP must be a string")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be exactly 6 characters")
        .trim(),
];

export const forgotPasswordValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    }
];

export const verifyForgotPasswordOTPValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    },
    body("otp")
        .isString()
        .withMessage("OTP must be a string")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be exactly 6 characters")
        .trim(),
];

export const resetPasswordValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email address")
        ,
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({ 
                errors: [{ msg: 'Either email or username is required' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    },
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

export const updateProfileValidations = [
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .trim(),
    body("fullName")
        .optional()
        .custom((value) => {
            if (typeof value !== 'object' || value === null) {
                throw new Error("Full name must be an object with firstName and lastName");
            }
            if (value.firstName && (typeof value.firstName !== 'string' || value.firstName.trim().length === 0)) {
                throw new Error("firstName must be a non-empty string");
            }
            if (value.lastName && (typeof value.lastName !== 'string' || value.lastName.trim().length === 0)) {
                throw new Error("lastName must be a non-empty string");
            }
            return true;
        }),
    body("currentPassword")
        .optional()
        .isString()
        .withMessage("Current password must be a string"),
    body("newPassword")
        .optional()
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
    (req, res, next) => {
        if ((req.body.currentPassword && !req.body.newPassword) || (!req.body.currentPassword && req.body.newPassword)) {
            return res.status(400).json({ 
                errors: [{ msg: 'Both currentPassword and newPassword are required to change password' }] 
            });
        }
        respondWithValidationErrors(req, res, next);
    },
];
