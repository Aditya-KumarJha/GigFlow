import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";
import mongoose from "mongoose";
import { publishToQueue } from "../broker/broker.js";
import { userSockets, getIo } from "../sockets/socket.server.js";

export const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({
        message: "gigId, message, and price are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const gig = await Gig.findById(gigId).populate("ownerId", "email username fullName");

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    if (gig.ownerId._id.equals(req.user._id)) {
      return res.status(403).json({
        message: "You cannot bid on your own gig",
      });
    }

    if (gig.status !== "open") {
      return res.status(400).json({
        message: "This gig is no longer accepting bids",
      });
    }

    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user._id,
    });

    if (existingBid) {
      return res.status(409).json({
        message: "You have already submitted a bid for this gig",
      });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price,
      status: "pending",
    });

    await bid.populate("freelancerId", "username fullName profilePic");
    await bid.populate("gigId", "title budget");

    publishToQueue("BID_NOTIFICATION.CREATED", {
      bid: {
        id: bid._id,
        message: bid.message,
        price: bid.price,
      },
      freelancer: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        fullName: req.user.fullName,
      },
      gig: {
        id: gig._id,
        title: gig.title,
        budget: gig.budget,
      },
      gigOwner: {
        id: gig.ownerId._id,
        email: gig.ownerId.email,
        username: gig.ownerId.username,
        fullName: gig.ownerId.fullName,
      },
    }).catch((err) => console.error("Failed to publish bid created event:", err));

    return res.status(201).json({
      message: "Bid submitted successfully",
      bid,
    });
  } catch (error) {
    console.error("Submit bid error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted a bid for this gig",
      });
    }

    return res.status(500).json({
      message: "Failed to submit bid",
    });
  }
};

export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    if (!mongoose.isValidObjectId(gigId)) {
      return res.status(400).json({
        message: "Invalid gig ID",
      });
    }

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    if (!gig.ownerId.equals(req.user._id)) {
      return res.status(403).json({
        message: "Only the gig owner can view bids",
      });
    }

    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "username fullName profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bids,
      meta: {
        total: bids.length,
        gigTitle: gig.title,
        gigStatus: gig.status,
      },
    });
  } catch (error) {
    console.error("Get bids error:", error);
    return res.status(500).json({
      message: "Failed to fetch bids",
    });
  }
};

export const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    if (!mongoose.isValidObjectId(bidId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid bid ID",
      });
    }

    const bid = await Bid.findById(bidId)
      .populate("gigId")
      .populate("freelancerId", "email username fullName")
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    const gig = bid.gigId;

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Associated gig not found",
      });
    }

    if (!gig.ownerId.equals(req.user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Only the gig owner can hire freelancers",
      });
    }

    if (gig.status !== "open") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "This gig has already been assigned",
      });
    }

    if (bid.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `This bid has already been ${bid.status}`,
      });
    }
    const pendingBids = await Bid.find({
      gigId: gig._id,
      _id: { $ne: bid._id },
      status: "pending",
    })
      .populate("freelancerId", "email username fullName")
      .session(session);

    gig.status = "assigned";
    await gig.save({ session });

    bid.status = "hired";
    await bid.save({ session });

    const rejectionResult = await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bid._id },
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const rejectedBidders = (pendingBids || []).map((b) => ({
      bidId: b._id,
      price: b.price,
      freelancer: {
        id: b.freelancerId?._id,
        email: b.freelancerId?.email,
        username: b.freelancerId?.username,
        fullName: b.freelancerId?.fullName,
      },
    }));

    publishToQueue("BID_NOTIFICATION.HIRED", {
      bid: {
        id: bid._id,
        price: bid.price,
        message: bid.message,
      },
      freelancer: {
        id: bid.freelancerId._id,
        email: bid.freelancerId.email,
        username: bid.freelancerId.username,
        fullName: bid.freelancerId.fullName,
      },
      gig: {
        id: gig._id,
        title: gig.title,
        budget: gig.budget,
      },
      client: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        fullName: req.user.fullName,
      },
      rejectedBidsCount: rejectionResult.modifiedCount,
      rejectedBidders,
    }).catch((err) => console.error("Failed to publish hire event:", err));

    try {
      const io = getIo();
      const freelancerIdStr = bid.freelancerId._id?.toString() || bid.freelancerId.toString();
      const freelancerSocketId = userSockets.get(freelancerIdStr);
      if (io && freelancerSocketId) {
        io.to(freelancerSocketId).emit("bid_hired", {
          message: `You have been hired for "${gig.title}"!`,
          gig: { id: gig._id, title: gig.title, budget: gig.budget },
          bid: { id: bid._id, price: bid.price, message: bid.message },
        });
      }

      if (Array.isArray(rejectedBidders) && rejectedBidders.length > 0) {
        for (const rb of rejectedBidders) {
          const rid = rb.freelancer?.id || rb.freelancer?.id?._id;
          const ridStr = rid ? rid.toString() : null;
          if (!ridStr) continue;
          const socketId = userSockets.get(ridStr);
          if (io && socketId) {
            io.to(socketId).emit("bid_rejected", {
              message: `Your bid for "${gig.title}" was not selected. Thanks for applying!`,
              gig: { id: gig._id, title: gig.title },
              bid: { id: rb.bidId, price: rb.price },
            });
          }
        }
      }
    } catch (err) {
      console.error('Socket notify error:', err);
    }

    return res.status(200).json({
      message: "Freelancer hired successfully",
      bid,
      rejectedBidsCount: rejectionResult.modifiedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Hire bid error:", error);
    return res.status(500).json({
      message: "Failed to hire freelancer",
    });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate("gigId", "title budget status ownerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bids,
      meta: {
        total: bids.length,
      },
    });
  } catch (error) {
    console.error("Get my bids error:", error);
    return res.status(500).json({
      message: "Failed to fetch your bids",
    });
  }
};
