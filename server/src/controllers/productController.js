const productService = require("../services/productService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");
const prisma = require("../prisma");

exports.createProduct = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("categoryId").notEmpty().withMessage("Category ID is required"),
  body("supplierId").notEmpty().withMessage("Supplier ID is required"),
  validate,
  async (req, res, next) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },
];

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    if (error.message === "Invalid product ID") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    next(error);
  }
};

exports.getActiveProducts = async (req, res, next) => {
  try {
    const products = await productService.getActiveProducts();
    res.json(products);
  } catch (error) {
    console.error("Error in getActiveProducts controller:", error);
    res.status(500).json({
      message: "Failed to fetch active products",
      error: error.message,
    });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Error in getProducts controller:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

exports.updateProduct = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Product name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  validate,
  async (req, res, next) => {
    try {
      // Convertir stock en entier si nécessaire avant la mise à jour
      if (req.body.stock) {
        req.body.stock = parseInt(req.body.stock, 10);
      }

      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
      );
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  },
];

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Marquer le produit comme supprimé
    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({
      message: "Product marked as deleted successfully.",
      product,
    });
  } catch (error) {
    console.error("Error marking product as deleted:", error);
    res.status(500).json({ error: "Error marking product as deleted." });
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await productService.getLowStockProducts(threshold);
    res.json(products);
  } catch (error) {
    next(error);
  }
};
