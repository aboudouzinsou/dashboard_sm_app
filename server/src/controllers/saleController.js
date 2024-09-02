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
  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number for each item"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total must be a positive number"),
  body("vatAmount")
    .isFloat({ min: 0 })
    .withMessage("VAT amount must be a positive number"),
  body("subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be a positive number"),
  validate,
  (exports.createSale = async (req, res, next) => {
    try {
      const { items, total, vatAmount, subtotal, employeeId } = req.body;
      const sale = await saleService.createSale({
        items,
        total,
        vatAmount,
        subtotal,
        employeeId,
      });
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  }),
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

exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch sales within the date range using Prisma
    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true, // Ensure `items` are included if you have a relation
      },
    });

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales by date range:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteSale = async (req, res, next) => {
  try {
    const saleId = req.params.id;
    await saleService.deleteSale(saleId);
    res.json({ message: "Sale and associated items deleted successfully" });
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
