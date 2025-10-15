// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPreferences,
  updatePreferences,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  getListeningHistory,
} = require("../controllers/userController");
const { protect } = require("../middlewares/auth");

// All routes are protected
router.use(protect);

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get("/preferences", getPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put("/preferences", updatePreferences);

/**
 * @route   GET /api/users/favorites
 * @desc    Get user's favorite audiobooks
 * @access  Private
 */
router.get("/favorites", getFavorites);

/**
 * @route   POST /api/users/favorites/:audiobookId
 * @desc    Add audiobook to favorites
 * @access  Private
 */
router.post("/favorites/:audiobookId", addToFavorites);

/**
 * @route   DELETE /api/users/favorites/:audiobookId
 * @desc    Remove audiobook from favorites
 * @access  Private
 */
router.delete("/favorites/:audiobookId", removeFromFavorites);

/**
 * @route   GET /api/users/listening-history
 * @desc    Get user's listening history
 * @access  Private
 */
router.get("/listening-history", getListeningHistory);

module.exports = router;
