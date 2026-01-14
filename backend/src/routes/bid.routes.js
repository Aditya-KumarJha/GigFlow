import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  submitBid,
  getBidsForGig,
  hireBid,
  getMyBids,
  updateBid,
  deleteBid,
} from "../controllers/bid.controller.js";
import {
  submitBidValidations,
  gigIdParamValidation,
  bidIdParamValidation,
  updateBidValidations,
} from "../validators/bid.validator.js";

const router = express.Router();

// Protected: Submit a bid on a gig
router.post("/", authMiddleware, submitBidValidations, submitBid);

// Protected: Get user's own bids (must come before /:gigId)
router.get("/my-bids", authMiddleware, getMyBids);

// Protected: Get all bids for a specific gig (owner only)
router.get("/:gigId", authMiddleware, gigIdParamValidation, getBidsForGig);

// Protected: Hire a freelancer (accept a bid)
router.patch("/:bidId/hire", authMiddleware, bidIdParamValidation, hireBid);

// Protected: Update own bid (only if pending)
router.patch("/:bidId", authMiddleware, bidIdParamValidation, updateBidValidations, updateBid);

// Protected: Delete own bid (only if pending)
router.delete("/:bidId", authMiddleware, bidIdParamValidation, deleteBid);

export default router;
