const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");

const router = express.Router();

// store files in uploads folder
const upload = multer({ dest: "uploads/" });

// API: upload file
router.post("/extract", upload.single("file"), fileController.extractContent);

module.exports = router;