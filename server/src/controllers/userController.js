const userService = require("../services/userService");
const { validate } = require("../middlewares/validationMiddleware");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const { format } = require("date-fns");

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
      if (user && user.id) {
        res.status(201).json({
          message: "User created successfully",
          userId: user.id,
          createdAt: format(
            new Date(user.createdAt),
            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
          ),
        });
      } else {
        throw new Error("User creation failed: Invalid user object returned");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already in use" });
      }
      res
        .status(500)
        .json({ message: "Internal server error during registration" });
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
    const { id } = req.params;

    if (id === "me") {
      // If the ID is 'me', use the authenticated user from the request
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      return res.json(req.user);
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUser controller:", error);
    if (error.message === "Invalid ID format") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
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

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  } catch (error) {
    console.error("Error in getMe:", error);
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
