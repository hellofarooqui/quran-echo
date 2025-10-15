// routes/audiobookRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllAudiobooks,
  getAudiobookById,
  getFeaturedAudiobooks,
  getGenres,
} = require("../controllers/audiobookController");

/**
 * @route   GET /api/audiobooks
 * @desc    Get all published audiobooks
 * @access  Public
 */
router.get("/", getAllAudiobooks);

/**
 * @route   GET /api/audiobooks/featured
 * @desc    Get featured audiobooks
 * @access  Public
 */
router.get("/featured", getFeaturedAudiobooks);

/**
 * @route   GET /api/audiobooks/genres
 * @desc    Get all available genres
 * @access  Public
 */
router.get("/genres", getGenres);

/**
 * @route   GET /api/audiobooks/:id
 * @desc    Get single audiobook with chapters
 * @access  Public
 */
router.get("/:id", getAudiobookById);

module.exports = router;
