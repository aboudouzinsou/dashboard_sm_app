const prisma = require("../prisma");

exports.createSupplier = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactInfo: contactInfo, // Directement assigner l'objet contactInfo
      },
    });
    res.status(201).json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res
      .status(500)
      .json({ error: "Error creating supplier", details: error.message });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching suppliers" });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { products: true, orders: true },
    });
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Error fetching supplier" });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;
    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: { name, contactInfo },
    });
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ error: "Error updating supplier" });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer le fournisseur et les produits associés automatiquement grâce à la cascade
    await prisma.supplier.delete({
      where: { id },
    });

    res.json({
      message: "Supplier and associated products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res
      .status(500)
      .json({ error: "Error deleting supplier", details: error.message });
  }
};
