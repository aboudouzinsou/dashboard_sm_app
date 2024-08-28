const prisma = require("../prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const settingsService = require("./settingsService");
const { ObjectId } = require("mongodb");

class UserService {
  async authenticate(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return { user, token };
  }

  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur sans utiliser de transaction
      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      return createdUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserService();
