"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { inventoryApi, settingsApi } from "@/lib/api";
import { RestockOrder, Receiving, Product, Supplier, Settings } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RestockAndReceivingPage() {
  const { user } = useAuth();
  const [restockOrders, setRestockOrders] = useState<RestockOrder[]>([]);
  const [receivings, setReceivings] = useState<Receiving[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<Settings>({
    id: "",
    storeName: "",
    timezone: "UTC",
    currency: "",
    lowStockThreshold: 0,
    vatRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestockOrder, setSelectedRestockOrder] =
    useState<RestockOrder | null>(null);
  const [selectedReceiving, setSelectedReceiving] = useState<Receiving | null>(
    null,
  );
  const [isCreateRestockDialogOpen, setIsCreateRestockDialogOpen] =
    useState(false);
  const [isCreateReceivingDialogOpen, setIsCreateReceivingDialogOpen] =
    useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        restockOrdersData,
        receivingsData,
        productsData,
        suppliersData,
        settingsData,
      ] = await Promise.all([
        inventoryApi.fetchRestockOrders(),
        inventoryApi.fetchReceivings(),
        inventoryApi.fetchProducts(),
        inventoryApi.fetchSuppliers(),
        settingsApi.fetchSettings(),
      ]);
      setRestockOrders(restockOrdersData);
      setReceivings(receivingsData);
      setProducts(productsData);
      setSuppliers(suppliersData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load initial data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRestockOrder = async (data: Partial<RestockOrder>) => {
    try {
      const newRestockOrder = await inventoryApi.createRestockOrder(data);
      setRestockOrders([...restockOrders, newRestockOrder]);
      toast({
        title: "Success",
        description: "Restock order created successfully.",
      });
      setIsCreateRestockDialogOpen(false);
    } catch (error) {
      console.error("Error creating restock order:", error);
      toast({
        title: "Error",
        description: "Failed to create restock order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReceiving = async (data: Partial<Receiving>) => {
    try {
      const newReceiving = await inventoryApi.createReceiving(data);
      setReceivings([...receivings, newReceiving]);
      toast({
        title: "Success",
        description: "Receiving created successfully.",
      });
      setIsCreateReceivingDialogOpen(false);
    } catch (error) {
      console.error("Error creating receiving:", error);
      toast({
        title: "Error",
        description: "Failed to create receiving. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateOrderPDF = (order: RestockOrder) => {
    const doc = new jsPDF();
    const supplier = suppliers.find((s) => s.id === order.supplierId);

    // En-tête
    doc.setFontSize(18);
    doc.text("Bon de Commande", 105, 15, { align: "center" });

    // Informations du magasin
    doc.setFontSize(12);
    doc.text(settings.storeName, 14, 25);
    // Ajoutez d'autres informations du magasin si nécessaire

    // Informations du fournisseur
    if (supplier) {
      doc.text("Fournisseur:", 14, 50);
      doc.text(supplier.name, 14, 56);
      doc.text(supplier.contactInfo.address, 14, 62);
      doc.text(`Tél: ${supplier.contactInfo.phone}`, 14, 68);
      doc.text(`Email: ${supplier.contactInfo.email}`, 14, 74);
    }

    // Détails de la commande
    doc.text(`Numéro de commande: ${order.id}`, 120, 50);
    doc.text(
      `Date de commande: ${format(new Date(order.orderDate), "dd/MM/yyyy")}`,
      120,
      56,
    );
    doc.text(`Statut: ${order.status}`, 120, 62);

    // Ligne de séparation
    doc.line(14, 80, 196, 80);

    // Tableau des articles commandés
    doc.autoTable({
      head: [["Produit", "Quantité commandée", "Prix unitaire", "Total"]],
      body: order.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const price = product ? product.price : 0;
        return [
          product?.name || "Produit inconnu",
          item.quantityOrdered,
          `${settings.currency} ${price.toFixed(2)}`,
          `${settings.currency} ${(price * item.quantityOrdered).toFixed(2)}`,
        ];
      }),
      startY: 85,
    });

    // Total de la commande
    const total = order.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantityOrdered : 0);
    }, 0);

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text(
      `Total de la commande: ${settings.currency} ${total.toFixed(2)}`,
      14,
      finalY + 10,
    );

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" },
      );
      doc.text(
        `Généré le ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        14,
        doc.internal.pageSize.height - 10,
      );
    }

    // Sauvegarde du PDF
    doc.save(`Bon_de_commande_${order.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Restock Orders</CardTitle>
              <CardDescription>
                Manage restock orders from suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {format(new Date(order.orderDate), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>
                        {suppliers.find((s) => s.id === order.supplierId)?.name}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRestockOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsCreateRestockDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Restock Order
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receivings</CardTitle>
              <CardDescription>Manage received inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Restock Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivings.map((receiving) => (
                    <TableRow key={receiving.id}>
                      <TableCell>
                        {format(new Date(receiving.dateReceived), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>{receiving.restockOrderId}</TableCell>
                      <TableCell>{receiving.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceiving(receiving)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsCreateReceivingDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Receiving
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Dialog
          open={isCreateRestockDialogOpen}
          onOpenChange={setIsCreateRestockDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Restock Order</DialogTitle>
            </DialogHeader>
            <CreateRestockOrderForm
              onSubmit={handleCreateRestockOrder}
              suppliers={suppliers}
              products={products}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateReceivingDialogOpen}
          onOpenChange={setIsCreateReceivingDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Receiving</DialogTitle>
            </DialogHeader>
            <CreateReceivingForm
              onSubmit={handleCreateReceiving}
              restockOrders={restockOrders}
              products={products}
              user={user}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!selectedRestockOrder}
          onOpenChange={() => setSelectedRestockOrder(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restock Order Details</DialogTitle>
            </DialogHeader>
            {selectedRestockOrder && (
              <RestockOrderDetails
                order={selectedRestockOrder}
                suppliers={suppliers}
                products={products}
                generateOrderPDF={generateOrderPDF}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!selectedReceiving}
          onOpenChange={() => setSelectedReceiving(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receiving Details</DialogTitle>
            </DialogHeader>
            {selectedReceiving && (
              <ReceivingDetails
                receiving={selectedReceiving}
                products={products}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

function CreateRestockOrderForm({ onSubmit, suppliers, products }) {
  const [formData, setFormData] = useState({
    supplierId: "",
    items: [{ productId: "", quantityOrdered: 0 }],
    status: "Pending",
  });

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [name]: value };
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantityOrdered: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="supplierId">Supplier</Label>
          <Select
            name="supplierId"
            value={formData.supplierId}
            onValueChange={(value) =>
              handleChange({ target: { name: "supplierId", value } })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formData.items.map((item, index) => (
          <div key={index} className="space-y-2">
            <Label>Product {index + 1}</Label>
            <Select
              name="productId"
              value={item.productId}
              onValueChange={(value) =>
                handleChange({ target: { name: "productId", value } }, index)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              name="quantityOrdered"
              value={item.quantityOrdered}
              onChange={(e) => handleChange(e, index)}
              placeholder="Quantity"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => removeItem(index)}
            >
              Remove Item
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addItem}>
          Add Item
        </Button>
      </div>
      <DialogFooter>
        <Button type="submit">Create Restock Order</Button>
      </DialogFooter>
    </form>
  );
}

function CreateReceivingForm({ onSubmit, restockOrders, products, user }) {
  const [formData, setFormData] = useState({
    restockOrderId: "",
    receivedById: user.id,
    items: [{ productId: "", quantityReceived: 0 }],
    status: "Completed",
  });

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [name]: value };
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantityReceived: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="restockOrderId">Restock Order</Label>
          <Select
            name="restockOrderId"
            value={formData.restockOrderId}
            onValueChange={(value) =>
              handleChange({ target: { name: "restockOrderId", value } })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a restock order" />
            </SelectTrigger>
            <SelectContent>
              {restockOrders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  {format(new Date(order.orderDate), "MM/dd/yyyy")} -{" "}
                  {order.supplierId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formData.items.map((item, index) => (
          <div key={index} className="space-y-2">
            <Label>Product {index + 1}</Label>
            <Select
              name="productId"
              value={item.productId}
              onValueChange={(value) =>
                handleChange({ target: { name: "productId", value } }, index)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              name="quantityReceived"
              value={item.quantityReceived}
              onChange={(e) => handleChange(e, index)}
              placeholder="Quantity Received"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => removeItem(index)}
            >
              Remove Item
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addItem}>
          Add Item
        </Button>
      </div>
      <DialogFooter>
        <Button type="submit">Create Receiving</Button>
      </DialogFooter>
    </form>
  );
}

function RestockOrderDetails({ order, suppliers, products, generateOrderPDF }) {
  return (
    <div className="space-y-4">
      <p>
        <strong>Order Date:</strong>{" "}
        {format(new Date(order.orderDate), "MM/dd/yyyy")}
      </p>
      <p>
        <strong>Supplier:</strong>{" "}
        {suppliers.find((s) => s.id === order.supplierId)?.name}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <h3 className="font-semibold">Ordered Items:</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity Ordered</TableHead>
            <TableHead>Quantity Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {products.find((p) => p.id === item.productId)?.name}
              </TableCell>
              <TableCell>{item.quantityOrdered}</TableCell>
              <TableCell>{item.quantityReceived}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => generateOrderPDF(order)}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimer le bon de commande
      </Button>
    </div>
  );
}

function ReceivingDetails({ receiving, products }) {
  return (
    <div className="space-y-4">
      <p>
        <strong>Date Received:</strong>{" "}
        {format(new Date(receiving.dateReceived), "MM/dd/yyyy")}
      </p>
      <p>
        <strong>Restock Order ID:</strong> {receiving.restockOrderId}
      </p>
      <p>
        <strong>Status:</strong> {receiving.status}
      </p>
      <h3 className="font-semibold">Received Items:</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receiving.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {products.find((p) => p.id === item.productId)?.name}
              </TableCell>
              <TableCell>{item.quantityReceived}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
