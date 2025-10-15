// controllers/userController.js
const User = require("../models/User");
const Progress = require("../models/Progress");

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("preferences");

    res.status(200).json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const { playbackSpeed, darkMode, autoPlay, downloadQuality } = req.body;

    const updateData = {};
    if (playbackSpeed !== undefined)
      updateData["preferences.playbackSpeed"] = playbackSpeed;
    if (darkMode !== undefined) updateData["preferences.darkMode"] = darkMode;
    if (autoPlay !== undefined) updateData["preferences.autoPlay"] = autoPlay;
    if (downloadQuality !== undefined)
      updateData["preferences.downloadQuality"] = downloadQuality;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("preferences");

    res.status(200).json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/favorites/:audiobookId
 * @desc    Add audiobook to favorites
 * @access  Private
 */
exports.addToFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.favoriteBooks.includes(req.params.audiobookId)) {
      return res.status(400).json({
        success: false,
        message: "Audiobook already in favorites",
      });
    }

    user.favoriteBooks.push(req.params.audiobookId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to favorites",
      data: user.favoriteBooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/favorites/:audiobookId
 * @desc    Remove audiobook from favorites
 * @access  Private
 */
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favoriteBooks: req.params.audiobookId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
      data: user.favoriteBooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/favorites
 * @desc    Get user's favorite audiobooks
 * @access  Private
 */
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favoriteBooks",
      select: "-__v",
    });

    res.status(200).json({
      success: true,
      count: user.favoriteBooks.length,
      data: user.favoriteBooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/listening-history
 * @desc    Get user's listening history
 * @access  Private
 */
exports.getListeningHistory = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const history = await Progress.find({ userId: req.user.id })
      .sort({ lastPlayedAt: -1 })
      .limit(parseInt(limit))
      .populate("audiobookId", "title author coverImageUrl")
      .populate("chapterId", "title chapterNumber duration");

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
