const saleService = require("../services/saleService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");

exports.createSale = [
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer for each item"),
  validate,
  async (req, res, next) => {
    try {
      const sale = await saleService.createSale({
        ...req.body,
        employeeId: req.user.id, // Assuming the user ID is attached to the request by the auth middleware
      });
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  },
];

exports.getSales = async (req, res, next) => {
  try {
    const sales = await saleService.getAllSales();
    res.json(sales);
  } catch (error) {
    next(error);
  }
};

exports.getSale = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    const saleId = req.params.id;

    const result = await saleService.deleteSale(saleId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDailySalesReport = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const report = await saleService.getDailySalesReport(date);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
