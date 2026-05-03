const express = require("express");
const router = express.Router();
const templateController = require("./template.controller");
const auth = require("../../shared/middlewares/auth");

router.use(auth);

router.get("/", templateController.getTemplates);
router.post("/", templateController.createTemplate);
router.get("/:templateId", templateController.getTemplate);
router.delete("/:templateId", templateController.deleteTemplate);
router.get("/:templateId/tasks", templateController.getTaskTemplates);
router.post("/:templateId/tasks", templateController.createTaskTemplate);

module.exports = router;