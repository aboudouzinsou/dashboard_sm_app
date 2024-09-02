const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// Placer la route /active avant /:id
router.get("/active", authenticateToken, productController.getActiveProducts);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  productController.createProduct,
);
router.get("/", authenticateToken, productController.getProducts);
router.get(
  "/low-stock",
  authenticateToken,
  productController.getLowStockProducts,
);
router.get("/:id", authenticateToken, productController.getProduct);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  productController.updateProduct,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  productController.deleteProduct,
);

module.exports = router;
