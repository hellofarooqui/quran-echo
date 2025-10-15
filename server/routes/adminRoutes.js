// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  createAudiobook,
  updateAudiobook,
  deleteAudiobook,
  uploadChapter,
  deleteChapter,
  togglePublishStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");
const upload = require("../config/multer");

// All routes are protected and admin only
router.use(protect);
router.use(authorize("admin"));

/**
 * @route   POST /api/admin/audiobooks
 * @desc    Create new audiobook
 * @access  Private/Admin
 */
router.post("/audiobooks", createAudiobook);

/**
 * @route   PUT /api/admin/audiobooks/:id
 * @desc    Update audiobook
 * @access  Private/Admin
 */
router.put("/audiobooks/:id", updateAudiobook);

/**
 * @route   DELETE /api/admin/audiobooks/:id
 * @desc    Delete audiobook
 * @access  Private/Admin
 */
router.delete("/audiobooks/:id", deleteAudiobook);

/**
 * @route   POST /api/admin/audiobooks/:id/chapters
 * @desc    Upload chapter audio file
 * @access  Private/Admin
 */
router.post("/audiobooks/:id/chapters", upload.single("audio"), uploadChapter);

/**
 * @route   DELETE /api/admin/chapters/:id
 * @desc    Delete chapter
 * @access  Private/Admin
 */
router.delete("/chapters/:id", deleteChapter);

/**
 * @route   PUT /api/admin/audiobooks/:id/publish
 * @desc    Publish/unpublish audiobook
 * @access  Private/Admin
 */
router.put("/audiobooks/:id/publish", togglePublishStatus);

module.exports = router;
