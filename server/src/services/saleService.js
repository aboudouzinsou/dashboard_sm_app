const prisma = require("../prisma");
const productService = require("./productService");
const settingsService = require("./settingsService");
const { PrismaClient } = require("@prisma/client");

class SaleService {
  async createSale(saleData) {
    const { items, total, vatAmount, subtotal, employeeId } = saleData;

    return prisma.sale.create({
      data: {
        total,
        vatAmount,
        subtotal,
        employeeId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }
  async deleteSale(saleId) {
    return prisma.$transaction(async (prisma) => {
      // Supprimer d'abord les items de vente associés
      await prisma.saleItem.deleteMany({
        where: { saleId: saleId },
      });

      // Ensuite, supprimer la vente
      const deletedSale = await prisma.sale.delete({
        where: { id: saleId },
      });

      return deletedSale;
    });
  }

  async getDailySalesReport(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.sale.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: { include: { product: true } },
        employee: true,
      },
    });
  }

  async getAllSales() {
    return prisma.sale.findMany({
      include: {
        items: { include: { product: true } },
        employee: true,
      },
    });
  }
}

module.exports = new SaleService();
