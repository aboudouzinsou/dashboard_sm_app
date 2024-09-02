const prisma = require("../prisma");

exports.createReceiving = async (req, res) => {
  console.log("Request body for createReceiving:", req.body);
  try {
    const { restockOrderId, items, status } = req.body;
    console.log("Creating receiving with data:", {
      restockOrderId,
      items,
      status,
    });

    // Vérifier l'état de la commande de réapprovisionnement avant de procéder
    const existingOrder = await prisma.restockOrder.findUnique({
      where: { id: restockOrderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Restock order not found" });
    }

    if (existingOrder.status === "Completed") {
      return res
        .status(400)
        .json({
          error:
            "This restock order is already completed. Cannot create a new receiving.",
        });
    }

    // Commencer une transaction
    const receiving = await prisma.$transaction(async (prisma) => {
      // Créer la réception
      const newReceiving = await prisma.receiving.create({
        data: {
          restockOrder: { connect: { id: restockOrderId } },
          receivedBy: { connect: { id: req.user.id } },
          items: {
            create: items.map((item) => ({
              product: { connect: { id: item.productId } },
              quantityReceived: Number(item.quantityReceived),
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

      // Mettre à jour la commande de réapprovisionnement et le stock des produits
      const restockOrder = await prisma.restockOrder.findUnique({
        where: { id: restockOrderId },
        include: { items: true },
      });

      let allItemsReceived = true;
      for (const orderItem of restockOrder.items) {
        const receivedItem = items.find(
          (item) => item.productId === orderItem.productId,
        );
        if (receivedItem) {
          const quantityReceived = Number(receivedItem.quantityReceived);

          // Mettre à jour l'OrderItem
          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: {
              quantityReceived: orderItem.quantityReceived + quantityReceived,
              status:
                orderItem.quantityOrdered ===
                orderItem.quantityReceived + quantityReceived
                  ? "Completed"
                  : "Partially Received",
            },
          });

          // Mettre à jour le stock du produit
          await prisma.product.update({
            where: { id: orderItem.productId },
            data: {
              stock: {
                increment: quantityReceived,
              },
            },
          });
        }
        if (
          orderItem.quantityOrdered !==
          orderItem.quantityReceived +
            (receivedItem ? Number(receivedItem.quantityReceived) : 0)
        ) {
          allItemsReceived = false;
        }
      }

      // Mettre à jour le statut de la commande de réapprovisionnement
      await prisma.restockOrder.update({
        where: { id: restockOrderId },
        data: {
          status: allItemsReceived ? "Completed" : "Partially Received",
        },
      });

      return newReceiving;
    });

    console.log("Receiving created:", receiving);
    res.status(201).json(receiving);
  } catch (error) {
    console.error("Error creating receiving:", error);
    res
      .status(500)
      .json({ error: "Error creating receiving", details: error.message });
  }
};

exports.getAllReceivings = async (req, res) => {
  console.log("Fetching all receivings");
  try {
    const receivings = await prisma.receiving.findMany({
      include: {
        restockOrder: true,
        receivedBy: true,
        items: { include: { product: true } },
      },
    });

    console.log("Receivings fetched:", receivings);
    res.json(receivings);
  } catch (error) {
    console.error("Error fetching receivings:", error);
    res.status(500).json({ error: "Error fetching receivings" });
  }
};

exports.getReceivingById = async (req, res) => {
  console.log("Fetching receiving by ID:", req.params.id);
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
      console.log("Receiving not found for ID:", id);
      return res.status(404).json({ error: "Receiving not found" });
    }

    console.log("Receiving fetched:", receiving);
    res.json(receiving);
  } catch (error) {
    console.error("Error fetching receiving:", error);
    res.status(500).json({ error: "Error fetching receiving" });
  }
};

exports.updateReceiving = async (req, res) => {
  console.log("Updating receiving with ID:", req.params.id);
  console.log("Update data:", req.body);
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

    console.log("Receiving updated:", updatedReceiving);
    res.json(updatedReceiving);
  } catch (error) {
    console.error("Error updating receiving:", error);
    res.status(500).json({ error: "Error updating receiving" });
  }
};

exports.deleteReceiving = async (req, res) => {
  console.log("Deleting receiving with ID:", req.params.id);
  try {
    const { id } = req.params;
    await prisma.receiving.delete({ where: { id } });

    console.log("Receiving deleted successfully with ID:", id);
    res.json({ message: "Receiving deleted successfully" });
  } catch (error) {
    console.error("Error deleting receiving:", error);
    res.status(500).json({ error: "Error deleting receiving" });
  }
};
