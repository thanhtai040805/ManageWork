const express = require("express");
const router = express.Router();
const timeController = require("./timeEntry.controller");
const auth = require("../../shared/middlewares/auth");

router.use(auth);

router.post("/", timeController.createEntry);
router.get("/", timeController.getUserEntries);
router.get("/task/:taskId", timeController.getTaskEntries);
router.get("/task/:taskId/total", timeController.getTaskTotalTime);
router.delete("/:entryId", timeController.deleteEntry);

module.exports = router;