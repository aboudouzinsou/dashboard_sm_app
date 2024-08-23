const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get("/", authenticateToken, settingsController.getSettings);
router.put(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  settingsController.updateSettings,
);

module.exports = router;
