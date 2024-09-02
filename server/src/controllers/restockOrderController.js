const prisma = require("../prisma");

exports.createRestockOrder = async (req, res) => {
  console.log("Creating restock order with data:", req.body);
  try {
    const { supplierId, items } = req.body;
    const restockOrder = await prisma.restockOrder.create({
      data: {
        supplierId,
        status: "Pending",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantityOrdered: Number(item.quantityOrdered),
            quantityReceived: 0,
            status: "Pending",
          })),
        },
      },
      include: { items: true },
    });
    console.log("Restock order created successfully:", restockOrder);
    res.status(201).json(restockOrder);
  } catch (error) {
    console.error("Error creating restock order:", error);
    res
      .status(500)
      .json({ error: "Error creating restock order", details: error.message });
  }
};

exports.getAllRestockOrders = async (req, res) => {
  console.log("Fetching all restock orders");
  try {
    const restockOrders = await prisma.restockOrder.findMany({
      include: { items: true, supplier: true },
    });
    console.log(`Found ${restockOrders.length} restock orders`);
    res.json(restockOrders);
  } catch (error) {
    console.error("Error fetching restock orders:", error);
    res
      .status(500)
      .json({ error: "Error fetching restock orders", details: error.message });
  }
};

exports.getRestockOrderById = async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching restock order with id: ${id}`);
  try {
    const restockOrder = await prisma.restockOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true },
    });
    if (!restockOrder) {
      console.log(`Restock order with id ${id} not found`);
      return res.status(404).json({ error: "Restock order not found" });
    }
    console.log("Restock order found:", restockOrder);
    res.json(restockOrder);
  } catch (error) {
    console.error(`Error fetching restock order with id ${id}:`, error);
    res
      .status(500)
      .json({ error: "Error fetching restock order", details: error.message });
  }
};

exports.updateRestockOrder = async (req, res) => {
  const { id } = req.params;
  console.log(`Updating restock order with id: ${id}`, req.body);
  try {
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
    console.log("Restock order updated successfully:", updatedRestockOrder);
    res.json(updatedRestockOrder);
  } catch (error) {
    console.error(`Error updating restock order with id ${id}:`, error);
    res
      .status(500)
      .json({ error: "Error updating restock order", details: error.message });
  }
};

exports.deleteRestockOrder = async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting restock order with id: ${id}`);
  try {
    await prisma.restockOrder.delete({ where: { id } });
    console.log(`Restock order with id ${id} deleted successfully`);
    res.json({ message: "Restock order deleted successfully" });
  } catch (error) {
    console.error(`Error deleting restock order with id ${id}:`, error);
    res
      .status(500)
      .json({ error: "Error deleting restock order", details: error.message });
  }
};
