"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer, Search, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { saleApi, settingsApi } from "@/lib/api";
import { SaleItem, Settings } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Sale {
  id: string;
  date: string;
  total: number;
  items: SaleItem[];
  employeeId: string;
}

export default function SalesManagementPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<Settings>({
    id: "",
    storeName: "",
    timezone: "",
    currency: "",
    lowStockThreshold: 0,
    vatRate: 0,
    createdAt: "",
    updatedAt: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, settingsData] = await Promise.all([
          saleApi.getSales(),
          settingsApi.fetchSettings(),
        ]);
        setSales(salesData);
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
    fetchData();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const salesData = await saleApi.fetchSalesByDateRange(startDate, endDate);
      setSales(salesData);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sales. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await saleApi.deleteSale(id);
      setSales(sales.filter((sale) => sale.id !== id));
      toast({
        title: "Success",
        description: "Sale deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete sale. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handlePrintSales = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // En-tête
    doc.setFontSize(18);
    doc.text(`${settings.storeName} Sales Report`, pageWidth / 2, 15, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${startDate || "N/A"} to ${endDate || "N/A"}`,
      14,
      25,
    );
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

    // Tableau des ventes
    const headers = [["Date", "Total", "Employee ID"]];
    const data = sales.map((sale) => [
      format(new Date(sale.date), "MM/dd/yyyy HH:mm"),
      `${sale.total.toFixed(2)} ${settings.currency}`,
      sale.employeeId,
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 40,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 },
    });

    // Pied de page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, {
        align: "right",
      });
      doc.text(`© ${settings.storeName}`, 14, pageHeight - 10);
    }

    // Calcul et affichage du total des ventes
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    doc.setFontSize(12);
    doc.text(
      `Total Sales: ${totalSales.toFixed(2)} ${settings.currency}`,
      14,
      doc.lastAutoTable.finalY + 10,
    );

    // Sauvegarder le PDF
    doc.save("sales_report.pdf");
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales Management</CardTitle>
          <CardDescription>Manage and view sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          <div id="salesTable">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.date), "MM/dd/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {sale.total.toFixed(2)} {settings.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSale(sale);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSale(sale);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePrintSales}>
            <Printer className="mr-2 h-4 w-4" /> Print Sales
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this sale? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSale) handleDeleteSale(selectedSale.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div>
              <p>
                <strong>Date:</strong>{" "}
                {format(new Date(selectedSale.date), "MM/dd/yyyy HH:mm")}
              </p>
              <p>
                <strong>Total:</strong> {selectedSale.total.toFixed(2)}{" "}
                {settings.currency}
              </p>
              <p>
                <strong>Employee ID:</strong> {selectedSale.employeeId}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.price.toFixed(2)} {settings.currency}
                      </TableCell>
                      <TableCell>
                        {(item.quantity * item.price).toFixed(2)}{" "}
                        {settings.currency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
