const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

const FOLDER_MAP = {
  avatar: "managework/avatars",
  task: "managework/tasks",
  chat: "managework/chat",
  project: "managework/projects",
  temp: "managework/temp",
};

const TRANSFORMATIONS = {
  avatar: {
    small: { width: 200, height: 200, crop: "fill", gravity: "face" },
    medium: { width: 400, height: 400, crop: "fill", gravity: "face" },
  },
  task: {
    preview: { width: 1200, crop: "limit" },
    thumbnail: { width: 300, height: 300, crop: "thumb" },
  },
  chat: {
    preview: { width: 800, crop: "limit" },
    thumbnail: { width: 200, height: 200, crop: "thumb" },
  },
  project: {
    cover: { width: 1920, height: 400, crop: "fill" },
    icon: { width: 256, height: 256, crop: "fill" },
  },
};

const FILE_LIMITS = {
  avatar: 5 * 1024 * 1024,
  task: 20 * 1024 * 1024,
  chat: 10 * 1024 * 1024,
  project: 10 * 1024 * 1024,
  temp: 10 * 1024 * 1024,
};

const getFolder = (type, id) => {
  const baseFolder = FOLDER_MAP[type] || "managework/others";
  return id ? `${baseFolder}/${id}` : baseFolder;
};

const createStorage = (type, id) => {
  cloudinaryConfig();
  const folder = getFolder(type, id);
  
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "rar", "mp4", "mov", "avi", "mp3", "wav"],
      resource_type: "auto",
      transformation: type === "avatar" ? [{ width: 800, height: 800, crop: "limit" }] : undefined,
    },
  });
};

const uploadSingle = async (file, type, id) => {
  cloudinaryConfig();
  const folder = getFolder(type, id);
  
  const result = await cloudinary.uploader.upload(file.path, {
    folder: folder,
    resource_type: "auto",
    transformation: type === "avatar" ? [{ width: 800, height: 800, crop: "limit" }] : undefined,
  });
  
  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    resourceType: result.resource_type,
  };
};

const uploadMultiple = async (files, type, id) => {
  const uploadPromises = files.map((file) => uploadSingle(file, type, id));
  return Promise.all(uploadPromises);
};

const deleteFile = async (publicId) => {
  cloudinaryConfig();
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "auto",
  });
  return result.result === "ok";
};

const getTransformedUrl = (publicId, type, variant = "original") => {
  cloudinaryConfig();
  
  const transformation = TRANSFORMATIONS[type]?.[variant];
  if (!transformation) {
    return cloudinary.url(publicId);
  }
  
  return cloudinary.url(publicId, {
    transformation: [transformation],
    secure: true,
  });
};

const getAvatarUrls = (publicId) => {
  cloudinaryConfig();
  return {
    original: cloudinary.url(publicId, { secure: true }),
    small: cloudinary.url(publicId, {
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
      secure: true,
    }),
    medium: cloudinary.url(publicId, {
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      secure: true,
    }),
  };
};

const getFileSizeLimit = (type) => {
  return FILE_LIMITS[type] || FILE_LIMITS.temp;
};

module.exports = {
  cloudinaryConfig,
  createStorage,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getTransformedUrl,
  getAvatarUrls,
  getFileSizeLimit,
  FILE_LIMITS,
  TRANSFORMATIONS,
};