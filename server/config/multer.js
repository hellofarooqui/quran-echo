// config/multer.js
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for audio files only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-m4a",
    "audio/m4a",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only audio files (MP3, WAV, M4A) are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000, // 500MB default
  },
});

module.exports = upload;
