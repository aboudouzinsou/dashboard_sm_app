const prisma = require("../prisma");
const settingsService = require("./settingsService");
const { formatCurrency } = require("../utils/formatters");
const { isMongoId } = require("validator");

class ProductService {
  async createProduct(productData) {
    const settings = await settingsService.getSettings();

    // Convertir le prix en nombre à virgule flottante
    const parsedProductData = {
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock, 10), // Assurez-vous également que le stock est un entier
    };

    const product = await prisma.product.create({
      data: parsedProductData,
    });

    product.formattedPrice = formatCurrency(product.price, settings.currency);
    return product;
  }

  async updateProduct(productId, productData) {
    // Convertir le stock en entier s'il est fourni
    if (productData.stock !== undefined) {
      productData.stock = parseInt(productData.stock, 10);
      if (isNaN(productData.stock)) {
        throw new Error("Stock must be a valid integer");
      }
    }

    return prisma.product.update({
      where: { id: productId },
      data: productData,
    });
  }

  async getProductById(productId) {
    if (!ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID");
    }
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async getActiveProducts() {
    return prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAllProducts() {
    try {
      return await prisma.product.findMany({
        include: {
          category: true,
          supplier: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw new Error("Failed to fetch products");
    }
  }

  async updateProduct(productId, productData) {
    return prisma.product.update({
      where: { id: productId },
      data: productData,
    });
  }

  async deleteProduct(productId) {
    return prisma.product.delete({
      where: { id: productId },
    });
  }

  async getLowStockProducts() {
    const settings = await settingsService.getSettings();
    return prisma.product.findMany({
      where: {
        stock: {
          lte: settings.lowStockThreshold,
        },
      },
    });
  }
}

module.exports = new ProductService();
