const express = require("express");
const router = express.Router();
const { globalSearch } = require("./search.controller");
const auth = require("../../shared/middlewares/auth");

router.get("/", auth, globalSearch);

module.exports = router;
