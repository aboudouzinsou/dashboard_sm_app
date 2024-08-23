const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.get(
  "/sales",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  reportController.getSalesReport,
);
router.get(
  "/top-selling",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  reportController.getTopSellingProducts,
);
router.get(
  "/low-stock",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  reportController.getLowStockProducts,
);

module.exports = router;
