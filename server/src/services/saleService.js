const prisma = require("../prisma");
const productService = require("./productService");
const settingsService = require("./settingsService");

class SaleService {
  async createSale(saleData) {
    const settings = await settingsService.getSettings();
    const { items, employeeId } = saleData;

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      saleItems.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        price: product.price,
      });

      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      });
    }

    const vatAmount = subtotal * (settings.vatRate / 100);
    const total = subtotal + vatAmount;

    return prisma.sale.create({
      data: {
        subtotal,
        vatRate: settings.vatRate,
        vatAmount,
        total,
        currency: settings.currency,
        employee: { connect: { id: employeeId } },
        items: {
          create: saleItems,
        },
      },
      include: {
        items: { include: { product: true } },
        employee: true,
      },
    });
  }
  async deleteSale(saleId) {
    // Récupère la vente avant de la supprimer pour ajuster les stocks
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!sale) {
      throw new Error(`Sale with id ${saleId} not found`);
    }

    // Ajuster les stocks en remettant les quantités vendues
    for (const saleItem of sale.items) {
      await prisma.product.update({
        where: { id: saleItem.productId },
        data: { stock: saleItem.product.stock + saleItem.quantity },
      });
    }

    // Suppression de la vente
    await prisma.sale.delete({
      where: { id: saleId },
    });

    return { message: "Sale deleted successfully" };
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
}

module.exports = new SaleService();
