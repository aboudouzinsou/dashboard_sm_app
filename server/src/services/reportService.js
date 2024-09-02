const prisma = require("../prisma");
const settingsService = require("./settingsService");
const { formatCurrency, adjustToTimezone } = require("../utils/formatters");

class ReportService {
  async getSalesReport(startDate, endDate) {
    const settings = await settingsService.getSettings();

    // Vérifiez la validité des dates fournies
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date provided");
    }

    // Ajuster les dates en fonction du fuseau horaire
    const start = adjustToTimezone(startDate, settings.timezone);
    const end = adjustToTimezone(endDate, settings.timezone);

    // Vérifiez la validité des objets Date ajustés
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid adjusted Date object");
    }

    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
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
      startDate: start,
      endDate: end,
      totalSales,
      formattedTotalSales,
      salesCount: sales.length,
      currency: settings.currency,
      productSales: Object.values(productSales),
    };
  }

  async getTopSellingProducts(limit = 10) {
    try {
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
      });

      const productIds = products.map((item) => item.productId);
      const detailedProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      const result = products.map((product) => {
        const details = detailedProducts.find(
          (p) => p.id === product.productId,
        );
        return {
          ...product,
          product: details,
        };
      });

      return result;
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
      throw error;
    }
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
