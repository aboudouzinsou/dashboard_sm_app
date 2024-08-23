const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  supplierController.createSupplier,
);
router.get("/", authenticateToken, supplierController.getAllSuppliers);
router.get("/:id", authenticateToken, supplierController.getSupplierById);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  supplierController.updateSupplier,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  supplierController.deleteSupplier,
);

module.exports = router;
