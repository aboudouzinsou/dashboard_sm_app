const userService = require("../services/userService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");

exports.register = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  body("role").isIn(["admin", "manager", "seller"]).withMessage("Invalid role"),
  validate,
  async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body);
      res
        .status(201)
        .json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      next(error);
    }
  },
];

exports.login = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await userService.authenticate(email, password);
      res.json({ user, token });
    } catch (error) {
      next(error);
    }
  },
];

exports.getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "seller"])
    .withMessage("Invalid role"),
  validate,
  async (req, res, next) => {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
];

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
