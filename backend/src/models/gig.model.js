import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "completed"],
      default: "open",
    },
    images: [
      {
        url: { type: String },
        thumbnail: { type: String },
        imagekitId: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

gigSchema.index({ title: "text" });

export default mongoose.model("Gig", gigSchema);
