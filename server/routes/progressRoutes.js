// routes/progressRoutes.js
const express = require("express");
const router = express.Router();
const {
  saveProgress,
  getProgressByAudiobook,
  getProgressByChapter,
  deleteProgress,
} = require("../controllers/progressController");
const { protect } = require("../middlewares/auth");

// All routes are protected
router.use(protect);

/**
 * @route   POST /api/progress
 * @desc    Save or update playback progress
 * @access  Private
 */
router.post("/", saveProgress);

/**
 * @route   GET /api/progress/:audiobookId
 * @desc    Get user's progress for a specific audiobook
 * @access  Private
 */
router.get("/:audiobookId", getProgressByAudiobook);

/**
 * @route   GET /api/progress/:audiobookId/:chapterId
 * @desc    Get user's progress for a specific chapter
 * @access  Private
 */
router.get("/:audiobookId/:chapterId", getProgressByChapter);

/**
 * @route   DELETE /api/progress/:audiobookId
 * @desc    Delete all progress for an audiobook
 * @access  Private
 */
router.delete("/:audiobookId", deleteProgress);

module.exports = router;
