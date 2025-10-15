// controllers/adminController.js
const Audiobook = require("../models/Audiobook");
const Chapter = require("../models/Chapter");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Upload");

/**
 * @route   POST /api/admin/audiobooks
 * @desc    Create new audiobook
 * @access  Private/Admin
 */
exports.createAudiobook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      narrator,
      description,
      coverImageUrl,
      genre,
      subGenres,
      language,
      publishedYear,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !author || !description || !coverImageUrl || !genre) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const audiobook = await Audiobook.create({
      title,
      author,
      narrator,
      description,
      coverImageUrl,
      genre,
      subGenres,
      language,
      publishedYear,
      tags,
      duration: 0, // Will be calculated when chapters are added
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Audiobook created successfully",
      data: audiobook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/audiobooks/:id
 * @desc    Update audiobook
 * @access  Private/Admin
 */
exports.updateAudiobook = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!audiobook) {
      return res.status(404).json({
        success: false,
        message: "Audiobook not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Audiobook updated successfully",
      data: audiobook,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/audiobooks/:id
 * @desc    Delete audiobook and all its chapters
 * @access  Private/Admin
 */
exports.deleteAudiobook = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findById(req.params.id);

    if (!audiobook) {
      return res.status(404).json({
        success: false,
        message: "Audiobook not found",
      });
    }

    // Delete all chapters and their audio files from S3
    const chapters = await Chapter.find({ audiobookId: audiobook._id });

    for (const chapter of chapters) {
      await deleteFromS3(chapter.audioFileKey);
    }

    // Delete all chapters from database
    await Chapter.deleteMany({ audiobookId: audiobook._id });

    // Delete audiobook
    await audiobook.deleteOne();

    res.status(200).json({
      success: true,
      message: "Audiobook and all chapters deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/audiobooks/:id/chapters
 * @desc    Upload chapter audio file
 * @access  Private/Admin
 */
exports.uploadChapter = async (req, res, next) => {
  try {
    const { id: audiobookId } = req.params;
    const { chapterNumber, title, duration } = req.body;

    // Check if audiobook exists
    const audiobook = await Audiobook.findById(audiobookId);
    if (!audiobook) {
      return res.status(404).json({
        success: false,
        message: "Audiobook not found",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file",
      });
    }

    // Validate required fields
    if (!chapterNumber || !title || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide chapterNumber, title, and duration",
      });
    }

    // Upload to S3
    const s3Result = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `audiobooks/${audiobookId}`
    );

    // Create chapter
    const chapter = await Chapter.create({
      audiobookId,
      chapterNumber: parseInt(chapterNumber),
      title,
      audioFileUrl: s3Result.location,
      audioFileKey: s3Result.key,
      duration: parseFloat(duration),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    // Update audiobook total duration and chapter count
    const chapters = await Chapter.find({ audiobookId });
    const totalDuration = chapters.reduce((sum, ch) => sum + ch.duration, 0);

    audiobook.duration = totalDuration;
    audiobook.totalChapters = chapters.length;
    await audiobook.save();

    res.status(201).json({
      success: true,
      message: "Chapter uploaded successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/chapters/:id
 * @desc    Delete chapter
 * @access  Private/Admin
 */
exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Delete audio file from S3
    await deleteFromS3(chapter.audioFileKey);

    // Delete chapter from database
    await chapter.deleteOne();

    // Update audiobook total duration and chapter count
    const audiobook = await Audiobook.findById(chapter.audiobookId);
    const chapters = await Chapter.find({ audiobookId: chapter.audiobookId });
    const totalDuration = chapters.reduce((sum, ch) => sum + ch.duration, 0);

    audiobook.duration = totalDuration;
    audiobook.totalChapters = chapters.length;
    await audiobook.save();

    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/audiobooks/:id/publish
 * @desc    Publish/unpublish audiobook
 * @access  Private/Admin
 */
exports.togglePublishStatus = async (req, res, next) => {
  try {
    const audiobook = await Audiobook.findById(req.params.id);

    if (!audiobook) {
      return res.status(404).json({
        success: false,
        message: "Audiobook not found",
      });
    }

    audiobook.isPublished = !audiobook.isPublished;
    await audiobook.save();

    res.status(200).json({
      success: true,
      message: `Audiobook ${
        audiobook.isPublished ? "published" : "unpublished"
      } successfully`,
      data: audiobook,
    });
  } catch (error) {
    next(error);
  }
};
