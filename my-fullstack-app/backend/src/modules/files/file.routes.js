const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile, getTaskFiles, deleteFile } = require("./file.controller");
const auth = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const { taskIdParamValidation, fileIdParamValidation } = require("./file.validation");
const { createStorage, getFileSizeLimit } = require("../../shared/services/cloudinary.service");

// Multer storage config - use cloudinary
const storage = createStorage("task");

const upload = multer({ 
  storage: storage,
  limits: { fileSize: getFileSizeLimit("task") }
});

router.post("/upload", auth, upload.single("file"), uploadFile);
router.get("/task/:taskId", auth, validate(taskIdParamValidation), getTaskFiles);
router.delete("/:fileId", auth, validate(fileIdParamValidation), deleteFile);

module.exports = router;
