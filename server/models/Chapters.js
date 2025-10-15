// models/Chapter.js
const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    audiobookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audiobook",
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: 1,
    },
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: [200, "Chapter title cannot exceed 200 characters"],
    },
    audioFileUrl: {
      type: String,
      required: [true, "Audio file URL is required"],
    },
    audioFileKey: {
      type: String,
      required: [true, "Audio file S3 key is required"],
    },
    duration: {
      type: Number, // Duration in seconds
      required: [true, "Duration is required"],
      min: 0,
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      default: "audio/mpeg",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
chapterSchema.index({ audiobookId: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);
