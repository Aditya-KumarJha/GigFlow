import Gig from "../models/gig.model.js";
import { publishToQueue } from "../broker/broker.js";
import { uploadImage, imagekit } from "../services/imagekit.service.js";
import fs from "fs/promises";

export const getGigs = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {
      status: "open",
      title: { $regex: search, $options: "i" },
    };

    const [total, gigs] = await Promise.all([
      Gig.countDocuments(filter),
      Gig.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "username fullName profilePic"),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const userId = req.user?._id?.toString();
    const gigsWithMeta = gigs.map((g) => {
      const plain = g.toObject();
      plain.editable = userId ? (plain.ownerId?._id?.toString() === userId) : false;
      return plain;
    });

    return res.status(200).json({
      gigs: gigsWithMeta,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get gigs error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "ownerId",
      "username fullName profilePic"
    );

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    return res.status(200).json({ gig });
  } catch (error) {
    console.error("Get gig by ID error:", error);
    return res.status(400).json({ message: "Invalid gig ID" });
  }
};

export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || budget === undefined) {
      return res.status(400).json({
        message: "Title, description, and budget are required",
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images are allowed" });
      }
      try {
        const uploadPromises = req.files.map(async (file) => {
          let buffer = file.buffer;
          if (!buffer && file.path) {
            buffer = await fs.readFile(file.path);
          }
          const uploaded = await uploadImage({ buffer });
          return { url: uploaded.url, thumbnail: uploaded.thumbnail, imagekitId: uploaded.id };
        });
        
        images = await Promise.all(uploadPromises);
      } catch (err) {
        console.error('Image upload failed:', err);
        return res.status(500).json({ message: 'Failed to upload images' });
      }
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id,
      status: "open",
      images,
    });

    try {
      await publishToQueue('GIG_NOTIFICATION.CREATED', {
        gig: {
          id: gig._id,
          title: gig.title,
          description: gig.description,
          budget: gig.budget,
          status: gig.status,
          images: gig.images || [],
        },
        owner: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
        },
      });
    } catch (err) {
      console.error('Failed to publish gig created event:', err);
    }

    return res.status(201).json({ gig });
  } catch (error) {
    console.error("Create gig error:", error);
    return res.status(400).json({ message: "Invalid gig data" });
  }
};

export const updateGig = async (req, res) => {
  try {
    const { title, description, budget, replaceImages } = req.body;

    let newImages = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images are allowed" });
      }
      try {
        const uploadPromises = req.files.map(async (file) => {
          let buffer = file.buffer;
          if (!buffer && file.path) {
            buffer = await fs.readFile(file.path);
          }
          const uploaded = await uploadImage({ buffer });
          return { url: uploaded.url, thumbnail: uploaded.thumbnail, imagekitId: uploaded.id };
        });
        
        newImages = await Promise.all(uploadPromises);
      } catch (err) {
        console.error('Image upload failed:', err);
        return res.status(500).json({ message: 'Failed to upload images' });
      }
    }

    let idsToRemove = [];
    if (req.body.imagesToRemove) {
      try {
        idsToRemove = Array.isArray(req.body.imagesToRemove)
          ? req.body.imagesToRemove
          : JSON.parse(req.body.imagesToRemove || "[]");
      } catch (err) {
        console.error('Failed to parse imagesToRemove:', err);
      }
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (budget !== undefined) updateFields.budget = budget;

    if (newImages.length > 0 || idsToRemove.length > 0) {
      const currentGig = await Gig.findOne({ 
        _id: req.params.id,
        ownerId: req.user._id,
        status: "open"
      });

      if (!currentGig) {
        return res.status(404).json({ message: "Gig not found or cannot be edited" });
      }

      let updatedImages = Array.isArray(currentGig.images) ? currentGig.images : [];

      if (idsToRemove.length > 0) {
        updatedImages = updatedImages.filter((img) => !idsToRemove.includes(img.imagekitId));
      }

      if (replaceImages === 'true' || replaceImages === true) {
        updatedImages = newImages;
      } else if (newImages.length > 0) {
        if ((updatedImages.length || 0) >= 3 && !(replaceImages === 'true' || replaceImages === true)) {
          return res.status(400).json({ message: 'Maximum 3 images allowed. Delete existing images before adding new ones.' });
        }

        if (updatedImages.length + newImages.length > 3) {
          return res.status(400).json({ message: 'Total images cannot exceed 3' });
        }

        updatedImages = updatedImages.concat(newImages);
      }

      updateFields.images = updatedImages;
    }

    const gig = await Gig.findOneAndUpdate(
      { 
        _id: req.params.id,
        ownerId: req.user._id,
        status: "open"  
      },
      { $set: updateFields },
      { 
        new: true,  
        runValidators: true
      }
    ).populate("ownerId", "email username fullName");

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found, you don't own it, or it cannot be edited (already assigned/completed)",
      });
    }

    try {
      await publishToQueue('GIG_NOTIFICATION.UPDATED', {
        gig: {
          id: gig._id,
          title: gig.title,
          description: gig.description,
          budget: gig.budget,
          status: gig.status,
          images: gig.images || [],
        },
        owner: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
        },
      });
    } catch (err) {
      console.error('Failed to publish gig updated event:', err);
    }

    return res.status(200).json({ gig });
  } catch (error) {
    console.error("Update gig error:", error);
    return res.status(400).json({ message: "Invalid update data" });
  }
};

export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
      status: "open"  
    });

    if (!gig) {
      return res.status(404).json({
        message: "Gig not found, you don't own it, or it cannot be deleted (already assigned/completed)",
      });
    }

    if (gig.images && Array.isArray(gig.images) && gig.images.length > 0) {
      for (const image of gig.images) {
        if (image.imagekitId) {
          try {
            await imagekit.deleteFile(image.imagekitId);
            console.log(`Deleted image ${image.imagekitId} from ImageKit`);
          } catch (err) {
            console.error(`Failed to delete image ${image.imagekitId} from ImageKit:`, err);
          }
        }
      }
    }

    try {
      await publishToQueue('GIG_NOTIFICATION.DELETED', {
        gig: {
          id: gig._id,
          title: gig.title,
          images: gig.images || [],
        },
        owner: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
        },
      });
    } catch (err) {
      console.error('Failed to publish gig deleted event:', err);
    }

    return res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Delete gig error:", error);
    return res.status(400).json({ message: "Invalid gig ID" });
  }
};

export const deleteGigImage = async (req, res) => {
  try {
    const { id: gigId, imageId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (!gig.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (gig.status !== "open") {
      return res.status(400).json({ message: "Cannot modify images for assigned or completed gigs" });
    }

    if (!Array.isArray(gig.images) || gig.images.length === 0) {
      return res.status(404).json({ message: "No images found for this gig" });
    }

    const imgIndex = gig.images.findIndex((img) => img.imagekitId === imageId);
    if (imgIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    const [removed] = gig.images.splice(imgIndex, 1);

    await gig.save();

    if (removed && removed.imagekitId) {
      try {
        await imagekit.deleteFile(removed.imagekitId);
        console.log(`Deleted image ${removed.imagekitId} from ImageKit`);
      } catch (err) {
        console.error(`Failed to delete image ${removed.imagekitId} from ImageKit:`, err);
      }
    }

    try {
      await publishToQueue('GIG_NOTIFICATION.UPDATED', {
        gig: {
          id: gig._id,
          title: gig.title,
          description: gig.description,
          budget: gig.budget,
          status: gig.status,
          images: gig.images || [],
        },
        owner: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          fullName: req.user.fullName,
        },
      });
    } catch (err) {
      console.error('Failed to publish gig updated event after image deletion:', err);
    }

    return res.status(200).json({ message: "Image deleted successfully", images: gig.images });
  } catch (error) {
    console.error("Delete gig image error:", error);
    return res.status(500).json({ message: "Failed to delete image" });
  }
};
