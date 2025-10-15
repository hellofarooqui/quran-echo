// models/Audiobook.js
const mongoose = require("mongoose");

const audiobookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    narrator: {
      type: String,
      trim: true,
      maxlength: [100, "Narrator name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    coverImageUrl: {
      type: String,
      required: [true, "Cover image is required"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      enum: [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Thriller",
        "Romance",
        "Science Fiction",
        "Fantasy",
        "Biography",
        "History",
        "Self-Help",
        "Business",
        "Technology",
        "Horror",
        "Poetry",
        "Drama",
        "Other",
      ],
    },
    subGenres: [
      {
        type: String,
      },
    ],
    language: {
      type: String,
      default: "English",
    },
    publishedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear() + 1,
    },
    duration: {
      type: Number, // Total duration in seconds
      required: true,
      min: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    totalChapters: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate chapters
audiobookSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "audiobookId",
  options: { sort: { chapterNumber: 1 } },
});

// Index for search and filtering
audiobookSchema.index({ title: "text", author: "text", description: "text" });
audiobookSchema.index({ genre: 1, isPublished: 1 });
audiobookSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Audiobook", audiobookSchema);
