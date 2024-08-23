const prisma = require("../prisma");

exports.createReceiving = async (req, res) => {
  try {
    const { restockOrderId, items, status } = req.body;
    const receiving = await prisma.receiving.create({
      data: {
        restockOrder: { connect: { id: restockOrderId } },
        receivedBy: { connect: { id: req.user.id } },
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantityReceived: item.quantityReceived,
          })),
        },
        status,
      },
      include: {
        restockOrder: true,
        receivedBy: true,
        items: { include: { product: true } },
      },
    });
    res.status(201).json(receiving);
  } catch (error) {
    res.status(500).json({ error: "Error creating receiving" });
  }
};

exports.getAllReceivings = async (req, res) => {
  try {
    const receivings = await prisma.receiving.findMany({
      include: {
        restockOrder: true,
        receivedBy: true,
        items: { include: { product: true } },
      },
    });
    res.json(receivings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching receivings" });
  }
};

exports.getReceivingById = async (req, res) => {
  try {
    const { id } = req.params;
    const receiving = await prisma.receiving.findUnique({
      where: { id },
      include: {
        restockOrder: true,
        receivedBy: true,
        items: { include: { product: true } },
      },
    });
    if (!receiving) {
      return res.status(404).json({ error: "Receiving not found" });
    }
    res.json(receiving);
  } catch (error) {
    res.status(500).json({ error: "Error fetching receiving" });
  }
};

exports.updateReceiving = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, status } = req.body;
    const updatedReceiving = await prisma.receiving.update({
      where: { id },
      data: {
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantityReceived: item.quantityReceived,
          })),
        },
        status,
      },
      include: {
        restockOrder: true,
        receivedBy: true,
        items: { include: { product: true } },
      },
    });
    res.json(updatedReceiving);
  } catch (error) {
    res.status(500).json({ error: "Error updating receiving" });
  }
};

exports.deleteReceiving = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.receiving.delete({ where: { id } });
    res.json({ message: "Receiving deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting receiving" });
  }
};
