const File = require("./models/file.model");
const logger = require("../../shared/utils/logger");
const { deleteFile: deleteCloudinaryFile } = require("../../shared/services/cloudinary.service");
const path = require("path");
const fs = require("fs");

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const { taskId, messageId } = req.body;
    const userId = req.user.uid;
    
    // Cloudinary stores the file info in req.file
    // The path field contains the uploaded file path that cloudinary used
    const fileUrl = req.file.path || req.file.secure_url || "";
    const fileType = req.file.mimetype;
    const cloudinaryPublicId = req.file.public_id || null;
    const fileSize = req.file.size || null;
    const originalFilename = req.file.originalname || null;

    const fileRecord = await File.create({
      fileUrl,
      fileType,
      uploadedBy: userId,
      taskId: taskId || null,
      messageId: messageId || null,
      cloudinaryPublicId,
      fileSize,
      originalFilename
    });

    logger.info(`File uploaded to Cloudinary: ${fileRecord.file_id} by user ${userId}`);
    res.status(201).json({
      status: "success",
      data: fileRecord
    });
  } catch (error) {
    next(error);
  }
};

const getTaskFiles = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const files = await File.findByTaskId(taskId);
    res.status(200).json({
      status: "success",
      data: files
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.uid;
    
    const record = await File.delete(fileId);
    if (record) {
      // Delete from Cloudinary if public_id exists
      if (record.cloudinary_public_id) {
        await deleteCloudinaryFile(record.cloudinary_public_id);
        logger.info(`Deleted from Cloudinary: ${record.cloudinary_public_id}`);
      } else {
        // Fallback to local file delete
        const filePath = path.join(__dirname, "../../../", record.file_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "File deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getTaskFiles,
  deleteFile
};
