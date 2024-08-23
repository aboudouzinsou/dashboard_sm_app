const reportService = require("../services/reportService");

exports.getSalesReport = async (req, res, next) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const report = await reportService.getSalesReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getTopSellingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await reportService.getTopSellingProducts(limit);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await reportService.getLowStockProducts(threshold);
    res.json(products);
  } catch (error) {
    next(error);
  }
};
