// models/Progress.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audiobookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audiobook",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    currentPosition: {
      type: Number, // Current position in seconds
      required: true,
      default: 0,
      min: 0,
    },
    chapterCompleted: {
      type: Boolean,
      default: false,
    },
    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying and ensuring one progress per user-book-chapter
progressSchema.index(
  { userId: 1, audiobookId: 1, chapterId: 1 },
  { unique: true }
);

// Index for fetching user's recent listening history
progressSchema.index({ userId: 1, lastPlayedAt: -1 });

module.exports = mongoose.model("Progress", progressSchema);
