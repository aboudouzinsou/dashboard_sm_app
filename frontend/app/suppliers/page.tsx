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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { settingsApi, supplierApi } from "@/lib/api";
import { Supplier, Settings } from "@/types";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    name: true,
    phone: true,
    email: true,
    address: true,
  });

  useEffect(() => {
    fetchSuppliers();
    fetchSettings();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = suppliers.filter((item) => {
      return Object.entries(filterOptions).some(([key, value]) => {
        if (!value) return false;
        if (key === "name") {
          return (
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.id.includes(lowercasedFilter)
          );
        }
        return item.contactInfo[key as keyof typeof item.contactInfo]
          .toLowerCase()
          .includes(lowercasedFilter);
      });
    });
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers, filterOptions]);

  const fetchSuppliers = async () => {
    try {
      const fetchedSuppliers = await supplierApi.getSuppliers();
      setSuppliers(fetchedSuppliers);
      setFilteredSuppliers(fetchedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const fetchedSettings = await settingsApi.fetchSettings();
      setStoreName(fetchedSettings.storeName || "Unknown Store");
      console.log("Fetched store name:", fetchedSettings.storeName);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleCreate = async (
    data: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const newSupplier = await supplierApi.createSupplier(data);
      setSuppliers([...suppliers, newSupplier]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  const handleUpdate = async (
    data: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>,
  ) => {
    try {
      if (currentSupplier) {
        const updatedSupplier = await supplierApi.updateSupplier(
          currentSupplier.id,
          data,
        );
        setSuppliers(
          suppliers.map((s) =>
            s.id === updatedSupplier.id ? updatedSupplier : s,
          ),
        );
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierApi.deleteSupplier(id);
      setSuppliers(suppliers.filter((s) => s.id !== id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const exportToPDF = () => {
    if (!storeName) {
      console.error("Store name is not set.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // En-tête
    doc.setFontSize(18);
    doc.text(`${storeName} Supplier Report`, pageWidth / 2, 15, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 25);

    // Corps - Tableau des fournisseurs
    const headers = [
      ["Name", "Phone", "Email", "Address", "Created At", "Updated At"],
    ];
    const data = filteredSuppliers.map((supplier) => [
      supplier.name,
      supplier.contactInfo.phone,
      supplier.contactInfo.email,
      supplier.contactInfo.address,
      new Date(supplier.createdAt).toLocaleDateString(),
      new Date(supplier.updatedAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 35,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });

    // Pied de page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, {
        align: "right",
      });
      doc.text(`© ${storeName}`, 14, pageHeight - 10);
    }

    // Sauvegarder le PDF
    doc.save("supplier_report.pdf");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <div className="flex gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
          <Button onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" /> Export to PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={filterOptions.name}
              onCheckedChange={(checked) =>
                setFilterOptions({ ...filterOptions, name: checked })
              }
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterOptions.phone}
              onCheckedChange={(checked) =>
                setFilterOptions({ ...filterOptions, phone: checked })
              }
            >
              Phone
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterOptions.email}
              onCheckedChange={(checked) =>
                setFilterOptions({ ...filterOptions, email: checked })
              }
            >
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterOptions.address}
              onCheckedChange={(checked) =>
                setFilterOptions({ ...filterOptions, address: checked })
              }
            >
              Address
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSuppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.contactInfo.phone}</TableCell>
              <TableCell>{supplier.contactInfo.email}</TableCell>
              <TableCell>{supplier.contactInfo.address}</TableCell>
              <TableCell>
                {new Date(supplier.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(supplier.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentSupplier(supplier);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentSupplier(supplier);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm
            onSubmit={handleUpdate}
            initialData={currentSupplier || undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this supplier? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                currentSupplier && handleDelete(currentSupplier.id)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupplierForm({
  onSubmit,
  initialData = {
    name: "",
    contactInfo: { phone: "", email: "", address: "" },
  },
}: {
  onSubmit: (data: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Partial<Supplier>;
}) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: initialData?.name || "",
    contactInfo: {
      phone: initialData?.contactInfo?.phone || "",
      email: initialData?.contactInfo?.email || "",
      address: initialData?.contactInfo?.address || "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("contactInfo.")) {
      const [, field] = name.split(".") as [
        string,
        keyof Supplier["contactInfo"],
      ];

      setFormData((prev) => {
        // Crée une copie sûre de contactInfo ou initialise un objet vide si absent
        const contactInfo = prev.contactInfo
          ? { ...prev.contactInfo }
          : { phone: "", email: "", address: "" };

        // Vérifie que 'field' est bien une clé de 'contactInfo'
        if (field in contactInfo) {
          contactInfo[field] = value; // Assigne la valeur en utilisant 'field' comme clé
        }

        return {
          ...prev,
          contactInfo,
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Supplier, "id" | "createdAt" | "updatedAt">);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contactInfo.phone" className="text-right">
            Phone
          </Label>
          <div className="col-span-3 relative">
            <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="contactInfo.phone"
              name="contactInfo.phone"
              value={formData.contactInfo?.phone || ""}
              onChange={handleChange}
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contactInfo.email" className="text-right">
            Email
          </Label>
          <div className="col-span-3 relative">
            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="contactInfo.email"
              name="contactInfo.email"
              type="email"
              value={formData.contactInfo?.email || ""}
              onChange={handleChange}
              className="pl-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contactInfo.address" className="text-right">
            Address
          </Label>
          <div className="col-span-3 relative">
            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="contactInfo.address"
              name="contactInfo.address"
              value={formData.contactInfo?.address || ""}
              onChange={handleChange}
              className="pl-8"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}
