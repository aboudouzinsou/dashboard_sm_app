const prisma = require("../prisma");

exports.createRestockOrder = async (req, res) => {
  try {
    const { supplierId, items } = req.body;
    const restockOrder = await prisma.restockOrder.create({
      data: {
        supplierId,
        status: "Pending",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantityOrdered: item.quantity,
            quantityReceived: 0,
            status: "Pending",
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(restockOrder);
  } catch (error) {
    res.status(500).json({ error: "Error creating restock order" });
  }
};

exports.getAllRestockOrders = async (req, res) => {
  try {
    const restockOrders = await prisma.restockOrder.findMany({
      include: { items: true, supplier: true },
    });
    res.json(restockOrders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching restock orders" });
  }
};

exports.getRestockOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const restockOrder = await prisma.restockOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true },
    });
    if (!restockOrder) {
      return res.status(404).json({ error: "Restock order not found" });
    }
    res.json(restockOrder);
  } catch (error) {
    res.status(500).json({ error: "Error fetching restock order" });
  }
};

exports.updateRestockOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId, items, status } = req.body;
    const updatedRestockOrder = await prisma.restockOrder.update({
      where: { id },
      data: {
        supplierId,
        status,
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            productId: item.productId,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: item.quantityReceived,
            status: item.status,
          })),
        },
      },
      include: { items: true },
    });
    res.json(updatedRestockOrder);
  } catch (error) {
    res.status(500).json({ error: "Error updating restock order" });
  }
};

exports.deleteRestockOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.restockOrder.delete({ where: { id } });
    res.json({ message: "Restock order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting restock order" });
  }
};
