const prisma = require("../prisma");
const settingsService = require("./settingsService");
const { formatCurrency } = require("../utils/formatters");

class ProductService {
  async createProduct(productData) {
    const settings = await settingsService.getSettings();
    const product = await prisma.product.create({
      data: productData,
    });

    product.formattedPrice = formatCurrency(product.price, settings.currency);

    return product;
  }

  async updateStock(productId, quantity) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    return prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
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
