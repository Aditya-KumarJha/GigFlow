import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Middleware to check validation results
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validations for submitting a bid
 */
export const submitBidValidations = [
  body("gigId")
    .notEmpty()
    .withMessage("Gig ID is required")
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Invalid gig ID format"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price cannot be negative"),

  checkValidation,
];

/**
 * Validation for gigId parameter
 */
export const gigIdParamValidation = [
  param("gigId")
    .notEmpty()
    .withMessage("Gig ID is required")
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Invalid gig ID format"),

  checkValidation,
];

/**
 * Validation for bidId parameter
 */
export const bidIdParamValidation = [
  param("bidId")
    .notEmpty()
    .withMessage("Bid ID is required")
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Invalid bid ID format"),

  checkValidation,
];
