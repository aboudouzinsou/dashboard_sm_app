const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.post(
  "/register",
  authenticateToken,
  authorizeRoles("admin"),
  userController.register,
);

router.post("/login", userController.login);

router.get(
  "/me",
  authenticateToken,
  authorizeRoles("admin", "manager", "seller"),
  userController.getMe,
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  userController.getUser,
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  userController.getAllUsers,
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  userController.updateUser,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  userController.deleteUser,
);

module.exports = router;
