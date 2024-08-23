const express = require("express");
const router = express.Router();
const restockOrderController = require("../controllers/restockOrderController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  restockOrderController.createRestockOrder,
);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  restockOrderController.getAllRestockOrders,
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  restockOrderController.getRestockOrderById,
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  restockOrderController.updateRestockOrder,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  restockOrderController.deleteRestockOrder,
);

module.exports = router;
