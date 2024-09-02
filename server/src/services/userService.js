const prisma = require("../prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { format } = require("date-fns");

class UserService {
  async authenticate(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign(
      { userId: user.id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    return { user, token };
  }

  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      return createdUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    console.log("Getting user by ID:", id);
    if (id === "me") {
      return null; // We'll handle this in the controller
    }
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    return prisma.user.findUnique({ where: { id: id } });
  }

  async updateUser(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  async getUserByToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      if (!decoded.userId) {
        throw new Error("Invalid token structure");
      }
      const userId = new ObjectId(decoded.userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log("User found:", user);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Error in getUserByToken:", error);
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else if (error.name === "TokenExpiredError") {
        throw new Error("Token expired");
      } else {
        throw new Error("Failed to authenticate token");
      }
    }
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return users.map((user) => ({
      ...user,
      createdAt: format(
        new Date(user.createdAt),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      ),
    }));
  }

  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserService();
