const productService = require("../services/productService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");

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

exports.getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
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

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
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
