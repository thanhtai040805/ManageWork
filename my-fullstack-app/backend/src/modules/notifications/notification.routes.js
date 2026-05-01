const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const authMiddleware = require("../../shared/middlewares/auth");
const validate = require("../../shared/middlewares/validation.middleware");
const { notificationIdParamValidation } = require("./notification.validation");

router.use(authMiddleware);

router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.put("/:id/read", validate(notificationIdParamValidation), notificationController.markAsRead);

module.exports = router;
