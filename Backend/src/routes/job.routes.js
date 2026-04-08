const express = require("express")
const router = express.Router()
const upload = require("../middlewares/file.middleware")
const authMiddleware = require("../middlewares/auth.middleware")
const { getJobsController } = require("../controllers/job.controller")

router.post("/", authMiddleware.authUser, upload.single("resume"), getJobsController)

module.exports = router