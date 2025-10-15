// utils/s3Upload.js
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} mimeType - File MIME type
 * @param {String} folder - S3 folder path
 * @returns {Object} - S3 upload result with key and location
 */
exports.uploadToS3 = async (
  fileBuffer,
  fileName,
  mimeType,
  folder = "audiobooks"
) => {
  try {
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    return {
      key: uniqueFileName,
      location: fileUrl,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Delete file from S3
 * @param {String} fileKey - S3 file key
 * @returns {Boolean} - Success status
 */
exports.deleteFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    return true;
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("Failed to delete file from S3");
  }
};

/**
 * Generate presigned URL for secure audio streaming
 * @param {String} fileKey - S3 file key
 * @param {Number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {String} - Presigned URL
 */
exports.getPresignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error("Presigned URL Error:", error);
    throw new Error("Failed to generate presigned URL");
  }
};
