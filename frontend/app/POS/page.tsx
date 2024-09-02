"use client";

import { useState, useEffect, useMemo } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer, Save, Search, X } from "lucide-react";
import { posApi } from "@/lib/api";
import { Product, SaleItem, Settings } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import "jspdf-autotable";
export default function POSPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
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
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsData, settingsData] = await Promise.all([
          posApi.fetchProducts(),
          posApi.fetchSettings(),
        ]);
        setProducts(productsData);
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
    fetchInitialData();
  }, []);

  const categories = useMemo(() => {
    const categorySet = new Set(products.map((product) => product.categoryId));
    return Array.from(categorySet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToSale = (product: Product) => {
    setSaleItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.id,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prevItems,
          {
            id: "",
            saleId: "",
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        ];
      }
    });
  };

  const removeFromSale = (productId: string) => {
    setSaleItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId),
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromSale(productId);
    } else {
      setSaleItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const calculateTotal = useMemo(() => {
    return saleItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [saleItems]);

  const calculateVAT = useMemo(() => {
    return calculateTotal * (settings.vatRate / 100);
  }, [calculateTotal, settings.vatRate]);

  const calculateGrandTotal = useMemo(() => {
    return calculateTotal + calculateVAT;
  }, [calculateTotal, calculateVAT]);

  const handleSaveSale = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a sale.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const saleData = {
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateGrandTotal,
        vatAmount: calculateVAT,
        subtotal: calculateTotal,
        employeeId: user.id,
      };

      await posApi.saveSale(saleData);
      toast({
        title: "Success",
        description: "Sale has been recorded successfully.",
      });
      setSaleItems([]);
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Failed to save sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = (
    saleData: {
      items: SaleItem[];
      total: number;
      vatAmount: number;
      subtotal: number;
      employeeId: string;
    },
    settings: Settings,
    products: Product[], // Pass the products data to get product names
  ) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Invoice", 14, 22);

    // Store details
    doc.setFontSize(12);
    doc.text(`Store: ${settings.storeName}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45);

    // Prepare product data with names
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    // Table header
    doc.autoTable({
      head: [["Product", "Quantity", "Price", "Total"]],
      body: saleData.items.map((item) => [
        productMap.get(item.productId) || "Unknown Product", // Use product name
        item.quantity.toString(),
        `${settings.currency}${item.price.toFixed(2)}`,
        `${settings.currency}${(item.price * item.quantity).toFixed(2)}`,
      ]),
      startY: 55,
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(
      `Subtotal: ${settings.currency}${saleData.subtotal.toFixed(2)}`,
      14,
      finalY,
    );
    doc.text(
      `VAT (${settings.vatRate}%): ${settings.currency}${saleData.vatAmount.toFixed(2)}`,
      14,
      finalY + 10,
    );
    doc.text(
      `Total: ${settings.currency}${saleData.total.toFixed(2)}`,
      14,
      finalY + 20,
    );

    // Save PDF
    doc.save("invoice.pdf");
  };

  const handlePrintInvoice = () => {
    if (saleItems.length === 0) return;

    const saleData = {
      items: saleItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      total: calculateGrandTotal,
      vatAmount: calculateVAT,
      subtotal: calculateTotal,
      employeeId: user?.id || "",
    };

    generatePDF(saleData, settings, products);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Select products to add to the sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search Products
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select
                value={selectedCategory || "all"} // Use a special value like "all" to represent no category selected
                onValueChange={(value) =>
                  setSelectedCategory(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>{" "}
                  {/* Special value for clearing selection */}
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredProducts.map((product) => (
                <Button
                  key={product.id}
                  onClick={() => addToSale(product)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center text-center"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.currency}
                    {product.price.toFixed(2)}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Sale</CardTitle>
            <CardDescription>Review and complete the sale</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <TableRow key={item.productId}>
                      <TableCell>{product?.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              parseInt(e.target.value),
                            )
                          }
                          className="w-20"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        {settings.currency}
                        {item.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {settings.currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromSale(item.productId)}
                          aria-label={`Remove ${product?.name} from sale`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col items-end">
            <div className="text-right mb-4 space-y-1">
              <div>
                Subtotal: {settings.currency}
                {calculateTotal.toFixed(2)}
              </div>
              <div>
                VAT ({settings.vatRate}%): {settings.currency}
                {calculateVAT.toFixed(2)}
              </div>
              <div className="font-bold text-lg">
                Total: {settings.currency}
                {calculateGrandTotal.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePrintInvoice}
                disabled={saleItems.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                onClick={handleSaveSale}
                disabled={isSaving || saleItems.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Sale
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
