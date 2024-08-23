const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  productController.createProduct,
);
router.get("/", authenticateToken, productController.getProducts);
router.get("/:id", authenticateToken, productController.getProduct);
router.get("/", authenticateToken, productController.getLowStockProducts);
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
