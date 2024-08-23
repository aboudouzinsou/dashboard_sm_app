const prisma = require("../prisma");
const settingsService = require("./settingsService");
const { formatCurrency, adjustToTimezone } = require("../utils/formatters");

class ReportService {
  async getSalesReport(startDate, endDate) {
    const settings = await settingsService.getSettings();

    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: adjustToTimezone(startDate, settings.timezone),
          lte: adjustToTimezone(endDate, settings.timezone),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        employee: true,
      },
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const formattedTotalSales = formatCurrency(totalSales, settings.currency);

    const productSales = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            total: 0,
          };
        }
        productSales[item.product.id].quantity += item.quantity;
        productSales[item.product.id].total += item.price * item.quantity;
      });
    });

    return {
      startDate,
      endDate,
      totalSales,
      salesCount: sales.length,
      currency: settings.currency,
      productSales: Object.values(productSales),
    };
  }

  async getTopSellingProducts(limit = 10) {
    const products = await prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
      include: {
        product: true,
      },
    });

    return products.map((p) => ({
      id: p.productId,
      name: p.product.name,
      totalQuantitySold: p._sum.quantity,
    }));
  }

  async getLowStockProducts() {
    const settings = await settingsService.getSettings();
    return prisma.product.findMany({
      where: {
        stock: {
          lte: settings.lowStockThreshold,
        },
      },
      orderBy: {
        stock: "asc",
      },
    });
  }
}

module.exports = new ReportService();
