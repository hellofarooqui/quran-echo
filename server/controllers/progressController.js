// controllers/progressController.js
const Progress = require("../models/Progress");
const Chapter = require("../models/Chapter");

/**
 * @route   POST /api/progress
 * @desc    Save or update playback progress
 * @access  Private
 */
exports.saveProgress = async (req, res, next) => {
  try {
    const { audiobookId, chapterId, currentPosition, chapterCompleted } =
      req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!audiobookId || !chapterId || currentPosition === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide audiobookId, chapterId, and currentPosition",
      });
    }

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Update or create progress
    const progress = await Progress.findOneAndUpdate(
      { userId, audiobookId, chapterId },
      {
        currentPosition,
        chapterCompleted: chapterCompleted || false,
        lastPlayedAt: Date.now(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Progress saved successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/:audiobookId
 * @desc    Get user's progress for a specific audiobook
 * @access  Private
 */
exports.getProgressByAudiobook = async (req, res, next) => {
  try {
    const { audiobookId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.find({ userId, audiobookId })
      .populate("chapterId", "title chapterNumber duration")
      .sort({ "chapterId.chapterNumber": 1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/progress/:audiobookId/:chapterId
 * @desc    Get user's progress for a specific chapter
 * @access  Private
 */
exports.getProgressByChapter = async (req, res, next) => {
  try {
    const { audiobookId, chapterId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({
      userId,
      audiobookId,
      chapterId,
    }).populate("chapterId", "title chapterNumber duration");

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: {
          currentPosition: 0,
          chapterCompleted: false,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/progress/:audiobookId
 * @desc    Delete all progress for an audiobook
 * @access  Private
 */
exports.deleteProgress = async (req, res, next) => {
  try {
    const { audiobookId } = req.params;
    const userId = req.user.id;

    await Progress.deleteMany({ userId, audiobookId });

    res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
