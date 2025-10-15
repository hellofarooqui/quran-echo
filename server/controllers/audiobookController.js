// controllers/audiobookController.js
const Audiobook = require("../models/Audiobook");
const Chapter = require("../models/Chapter");

/**
 * @route   GET /api/audiobooks
 * @desc    Get all published audiobooks with pagination and filters
 * @access  Public
 */
exports.getAllAudiobooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      genre,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = { isPublished: true };

    // Filter by genre
    if (genre) {
      query.genre = genre;
    }

    // Search by title, author, or description
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const audiobooks = await Audiobook.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    const total = await Audiobook.countDocuments(query);

    res.status(200).json({
      success: true,
      count: audiobooks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: audiobooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/audiobooks/:id
 * @desc    Get single audiobook with all chapters
 * @access  Public
 */
exports.getAudiobookById = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .select("-__v");

    if (!audiobook) {
      return res.status(404).json({
        success: false,
        message: "Audiobook not found",
      });
    }

    if (!audiobook.isPublished) {
      return res.status(403).json({
        success: false,
        message: "Audiobook is not published yet",
      });
    }

    // Get all chapters for this audiobook
    const chapters = await Chapter.find({ audiobookId: audiobook._id })
      .sort({ chapterNumber: 1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      data: {
        ...audiobook.toObject(),
        chapters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/audiobooks/featured
 * @desc    Get featured audiobooks
 * @access  Public
 */
exports.getFeaturedAudiobooks = async (req, res, next) => {
  try {
    const audiobooks = await Audiobook.find({
      isPublished: true,
      isFeatured: true,
    })
      .limit(10)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: audiobooks.length,
      data: audiobooks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/audiobooks/genres
 * @desc    Get all available genres
 * @access  Public
 */
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await Audiobook.schema.path("genre").enumValues;

    res.status(200).json({
      success: true,
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};
