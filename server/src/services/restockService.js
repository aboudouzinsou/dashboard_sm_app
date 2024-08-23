const prisma = require("../prisma");
const productService = require("./productService");
const settingsService = require('./settingsService');

class RestockService {
  async createRestockOrder(orderData) {
    const { supplierId, items } = orderData;

    const orderItems = items.map((item) => ({
      product: { connect: { id: item.productId } },
      quantityOrdered: item.quantity,
      quantityReceived: 0,
      status: "Pending",
    }));

    return prisma.restockOrder.create({
      data: {
        supplier: { connect: { id: supplierId } },
        items: {
          create: orderItems,
        },
        status: "Pending",
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
  }

  sync suggestRestockItems() {
      const settings = await settingsService.getSettings();

      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: settings.lowStockThreshold,
          },
        },
        include: {
          supplier: true,
        },
      });

      return lowStockProducts.map(product => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        suggestedOrderQuantity: settings.lowStockThreshold - product.stock + 10, // Example logic
        supplierId: product.supplier.id,
        supplierName: product.supplier.name,
      }));
    }

  async receiveRestockOrder(receivingData) {
    const { restockOrderId, items } = receivingData;

    const restockOrder = await prisma.restockOrder.findUnique({
      where: { id: restockOrderId },
      include: { items: true },
    });

    if (!restockOrder) {
      throw new Error("Restock order not found");
    }

    for (const item of items) {
      const orderItem = restockOrder.items.find(
        (i) => i.productId === item.productId,
      );
      if (!orderItem) {
        throw new Error(
          `Product ${item.productId} not found in the restock order`,
        );
      }

      if (
        orderItem.quantityReceived + item.quantityReceived >
        orderItem.quantityOrdered
      ) {
        throw new Error(
          `Received quantity exceeds ordered quantity for product ${item.productId}`,
        );
      }

      await productService.updateStock(item.productId, item.quantityReceived);

      await prisma.orderItem.update({
        where: { id: orderItem.id },
        data: {
          quantityReceived: orderItem.quantityReceived + item.quantityReceived,
          status:
            orderItem.quantityReceived + item.quantityReceived ===
            orderItem.quantityOrdered
              ? "Completed"
              : "Partially Received",
        },
      });
    }

    const updatedOrder = await prisma.restockOrder.findUnique({
      where: { id: restockOrderId },
      include: { items: true },
    });

    const allItemsReceived = updatedOrder.items.every(
      (item) => item.status === "Completed",
    );

    return prisma.restockOrder.update({
      where: { id: restockOrderId },
      data: {
        status: allItemsReceived ? "Completed" : "Partially Received",
        receivedDate: allItemsReceived ? new Date() : undefined,
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
  }
}

module.exports = new RestockService();
