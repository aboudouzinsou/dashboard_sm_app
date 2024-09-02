const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager", "saler"),
  saleController.createSale,
);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  saleController.getSales,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  saleController.getSale,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  saleController.getDailySalesReport,
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  saleController.getSalesByDateRange,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  saleController.deleteSale,
);

module.exports = router;
