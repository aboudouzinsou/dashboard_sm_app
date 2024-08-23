const settingsService = require("../services/settingsService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = [
  body("storeName")
    .optional()
    .notEmpty()
    .withMessage("Store name cannot be empty"),
  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
  body("timezone")
    .optional()
    .notEmpty()
    .withMessage("Timezone cannot be empty"),
  body("lowStockThreshold")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Low stock threshold must be a positive integer"),
  body("vatRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("VAT rate must be between 0 and 100"),
  validate,
  async (req, res, next) => {
    try {
      const updatedSettings = await settingsService.updateSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      next(error);
    }
  },
];
