const prisma = require("../prisma");

exports.createSupplier = async (req, res) => {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, contactInfo },
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Error creating supplier" });
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
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting supplier" });
  }
};
