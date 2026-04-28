const express = require("express");
const router = express.Router();
const { getAccount, updateProfile } = require("./user.controller");
const auth = require("../../shared/middlewares/auth");

router.get("/", auth, getAccount);
router.put("/profile", auth, updateProfile);

module.exports = router;
