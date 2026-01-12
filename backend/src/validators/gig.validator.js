import { body, param, query, validationResult } from "express-validator";

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const getGigsValidations = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search query must be a string")
    .trim(),
  respondWithValidationErrors,
];

export const gigIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid gig ID"),
  respondWithValidationErrors,
];

export const createGigValidations = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required")
    .trim(),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description is required"),

  body("budget")
    .isNumeric()
    .withMessage("Budget must be a number")
    .custom((value) => value >= 0)
    .withMessage("Budget must be greater than or equal to 0"),

  respondWithValidationErrors,
];

export const updateGigValidations = [
  param("id")
    .isMongoId()
    .withMessage("Invalid gig ID"),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .trim(),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("budget")
    .optional()
    .isNumeric()
    .withMessage("Budget must be a number")
    .custom((value) => value >= 0)
    .withMessage("Budget must be greater than or equal to 0"),

  respondWithValidationErrors,
];

export const imageIdParamValidation = [
  param("imageId")
    .notEmpty()
    .withMessage("Image id is required"),
  respondWithValidationErrors,
];
