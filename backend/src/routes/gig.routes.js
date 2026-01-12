import express from "express";
import { authMiddleware, optionalAuth } from "../middlewares/auth.middleware.js";
import {
  getGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig,
  deleteGigImage,
} from "../controllers/gig.controller.js";
import {
  getGigsValidations,
  gigIdParamValidation,
  createGigValidations,
  updateGigValidations,
  imageIdParamValidation,
} from "../validators/gig.validator.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public: Browse open gigs (optional auth to allow editable flag)
router.get("/", optionalAuth, getGigsValidations, getGigs);

// Public: Get gig details
router.get("/:id", gigIdParamValidation, getGigById);

// Protected: Create gig
router.post("/", authMiddleware, uploadMultiple, createGigValidations, createGig);

// Protected: Update gig (owner only)
router.patch("/:id", authMiddleware, uploadMultiple, updateGigValidations, updateGig);

// Protected: Delete gig (owner only)
router.delete("/:id", authMiddleware, gigIdParamValidation, deleteGig);

// Protected: Delete a single image from a gig (owner only)
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  gigIdParamValidation,
  imageIdParamValidation,
  deleteGigImage
);

export default router;
