import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import { publishToQueue } from "../broker/broker.js";
import { userSockets, getIo, emitToUser } from "../sockets/socket.server.js";

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

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const gig = await Gig.findById(gigId).populate("ownerId", "email username fullName");

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found",
      });
    }

    const ownerIdStr = gig.ownerId?._id?.toString() || (gig.ownerId ? gig.ownerId.toString() : null);
    const userIdStr = req.user._id.toString();
    if (ownerIdStr && ownerIdStr === userIdStr) {
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

    try {
      const ownerId = gig.ownerId?._id || gig.ownerId;
      if (ownerId) {
        await Notification.create({
          userId: ownerId,
          type: 'new_bid',
          title: 'New Bid Received',
          message: `${req.user.username || 'A freelancer'} placed a bid on "${gig.title}"`,
          data: {
            gigId: gig._id,
            gigTitle: gig.title,
            bidId: bid._id,
            price: bid.price,
            freelancerId: req.user._id,
            freelancerName: req.user.username || req.user.fullName,
          },
        });

        emitToUser(ownerId, 'new_bid', {
          message: `${req.user.username || 'A freelancer'} placed a bid on "${gig.title}"`,
          gig: { id: gig._id, title: gig.title },
          bid: { id: bid._id, price: bid.price },
        });
      }
    } catch (err) {
      console.error('Failed to create new bid notification:', err);
    }

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
        id: gig.ownerId?._id || (gig.ownerId ? gig.ownerId.toString() : null),
        email: gig.ownerId?.email || null,
        username: gig.ownerId?.username || null,
        fullName: gig.ownerId?.fullName || null,
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
    try {
      await Notification.create({
        userId: bid.freelancerId._id,
        type: 'bid_hired',
        title: 'Bid Accepted!',
        message: `You have been hired for "${gig.title}"!`,
        data: {
          gigId: gig._id,
          gigTitle: gig.title,
          bidId: bid._id,
          price: bid.price,
        },
      });

      emitToUser(bid.freelancerId._id, 'bid_hired', {
        message: `You have been hired for "${gig.title}"!`,
        gig: { id: gig._id, title: gig.title, budget: gig.budget },
        bid: { id: bid._id, price: bid.price, message: bid.message },
      });
    } catch (err) {
      console.error('Failed to create hired notification or emit socket:', err);
    }

    if (Array.isArray(pendingBids) && pendingBids.length > 0) {
      try {
        const notificationsToCreate = pendingBids
          .map((b) => ({
            userId: b.freelancerId?._id,
            type: 'bid_rejected',
            title: 'Bid Not Selected',
            message: `Your bid for "${gig.title}" was not selected. Thanks for applying!`,
            data: {
              gigId: gig._id,
              gigTitle: gig.title,
              bidId: b._id,
              price: b.price,
            },
          }))
          .filter((n) => n.userId);

        if (notificationsToCreate.length > 0) {
          await Notification.insertMany(notificationsToCreate);
        }

        for (const b of pendingBids) {
          const rid = b.freelancerId?._id;
          if (rid) {
            emitToUser(rid, 'bid_rejected', {
              message: `Your bid for "${gig.title}" was not selected. Thanks for applying!`,
              gig: { id: gig._id, title: gig.title },
              bid: { id: b._id, price: b.price },
            });
          }
        }
      } catch (err) {
        console.error('Failed to create rejection notifications or emit sockets:', err);
      }
    }

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

    return res.status(200).json({
      message: "Freelancer hired successfully",
      bid,
      rejectedBidsCount: rejectionResult.modifiedCount,
    });
  } catch (error) {
    // Only abort if transaction is still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
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

export const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { message, price } = req.body;

    if (!mongoose.isValidObjectId(bidId)) {
      return res.status(400).json({
        message: "Invalid bid ID",
      });
    }

    const bid = await Bid.findById(bidId).populate({
      path: "gigId",
      select: "title status ownerId",
      populate: { path: "ownerId", select: "email username fullName" },
    });

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    if (!bid.freelancerId.equals(req.user._id)) {
      return res.status(403).json({
        message: "You can only update your own bids",
      });
    }

    if (bid.status !== "pending") {
      return res.status(400).json({
        message: `Cannot update a ${bid.status} bid`,
      });
    }

    if (bid.gigId && bid.gigId.status !== "open") {
      return res.status(400).json({
        message: "Cannot update bid for a gig that is no longer open",
      });
    }

    if (message !== undefined) {
      bid.message = message;
    }
    
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          message: "Price cannot be negative",
        });
      }
      bid.price = price;
    }

    await bid.save();
    await bid.populate("freelancerId", "username fullName profilePic");
    await bid.populate("gigId", "title budget status");

    try {
      await publishToQueue("BID_NOTIFICATION.UPDATED", {
        bid: {
          id: bid._id,
          message: bid.message,
          price: bid.price,
          status: bid.status,
        },
        freelancer: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
        },
        gig: {
          id: bid.gigId._id,
          title: bid.gigId.title,
        },
        gigOwner: bid.gigId && bid.gigId.ownerId ? {
          id: bid.gigId.ownerId._id || bid.gigId.ownerId,
          email: bid.gigId.ownerId.email || null,
          username: bid.gigId.ownerId.username || null,
          fullName: bid.gigId.ownerId.fullName || null,
        } : null,
      });
    } catch (err) {
      console.error("Failed to publish bid updated event:", err);
    }

    return res.status(200).json({
      message: "Bid updated successfully",
      bid,
    });
  } catch (error) {
    console.error("Update bid error:", error);
    return res.status(500).json({
      message: "Failed to update bid",
    });
  }
};

export const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    if (!mongoose.isValidObjectId(bidId)) {
      return res.status(400).json({
        message: "Invalid bid ID",
      });
    }

    const bid = await Bid.findById(bidId).populate({
      path: "gigId",
      select: "title status ownerId",
      populate: { path: "ownerId", select: "email username fullName" },
    });

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    if (!bid.freelancerId.equals(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own bids",
      });
    }

    if (bid.status !== "pending") {
      return res.status(400).json({
        message: `Cannot delete a ${bid.status} bid`,
      });
    }

    await Bid.deleteOne({ _id: bidId });

    try {
      await publishToQueue("BID_NOTIFICATION.DELETED", {
        bid: {
          id: bid._id,
          price: bid.price,
        },
        freelancer: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
        },
        gig: bid.gigId ? {
          id: bid.gigId._id,
          title: bid.gigId.title,
        } : null,
        gigOwner: bid.gigId && bid.gigId.ownerId ? {
          id: bid.gigId.ownerId._id || bid.gigId.ownerId,
          email: bid.gigId.ownerId.email || null,
          username: bid.gigId.ownerId.username || null,
          fullName: bid.gigId.ownerId.fullName || null,
        } : null,
      });
    } catch (err) {
      console.error("Failed to publish bid deleted event:", err);
    }

    return res.status(200).json({
      message: "Bid deleted successfully",
    });
  } catch (error) {
    console.error("Delete bid error:", error);
    return res.status(500).json({
      message: "Failed to delete bid",
    });
  }
};
