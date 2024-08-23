const express = require("express");
const router = express.Router();
const receivingController = require("../controllers/receivingController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  receivingController.createReceiving,
);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  receivingController.getAllReceivings,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  receivingController.getReceivingById,
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  receivingController.updateReceiving,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  receivingController.deleteReceiving,
);

module.exports = router;
