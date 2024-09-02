"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  ArrowUpDown,
  Download,
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";

import { productApi, categoryApi, supplierApi, settingsApi } from "@/lib/api";
import { Product, Category, Supplier, Settings } from "@/types";

export interface FormData {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  supplierId?: string;
}

type ProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt">;
type CategoryFormData = {
  name: string;
};

export default function Component() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [storeName, setStoreName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products",
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Product | Category | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = products.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.description?.toLowerCase().includes(lowercasedFilter) ||
        item.categoryId.toLowerCase().includes(lowercasedFilter) ||
        item.supplierId.toLowerCase().includes(lowercasedFilter),
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchData = async () => {
    try {
      const [
        fetchedProducts,
        fetchedCategories,
        fetchedSuppliers,
        fetchedSettings,
      ] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        supplierApi.getSuppliers(),
        settingsApi.fetchSettings(),
      ]);
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setSuppliers(fetchedSuppliers);
      setStoreName(fetchedSettings.storeName);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreate = async (data: CategoryFormData) => {
    try {
      const newCategory = await categoryApi.create(data);
      setCategories([...categories, newCategory]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      const newProduct = await productApi.create(data);
      setProducts([...products, newProduct]);
      setFilteredProducts([...filteredProducts, newProduct]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    try {
      if (currentItem && currentItem.id) {
        const updatedProduct = await productApi.update(currentItem.id, data);
        setProducts(
          products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p,
          ),
        );
        setFilteredProducts(
          filteredProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p,
          ),
        );
      }
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    try {
      if (currentItem && currentItem.id) {
        const updatedCategory = await categoryApi.update(currentItem.id, data);
        setCategories(
          categories.map((c) =>
            c.id === updatedCategory.id ? updatedCategory : c,
          ),
        );
      }
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === "products") {
        await productApi.delete(id);
        setProducts(products.filter((p) => p.id !== id));
        setFilteredProducts(filteredProducts.filter((p) => p.id !== id));
      } else {
        await categoryApi.delete(id);
        setCategories(categories.filter((c) => c.id !== id));
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSort = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // En-tête
    doc.setFontSize(18);
    doc.text(`${storeName} Inventory Report`, pageWidth / 2, 15, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 25);

    // Corps - Tableau des produits
    const productHeaders = [
      ["Name", "Description", "Price", "Stock", "Category", "Supplier"],
    ];
    const productData = filteredProducts.map((product) => [
      product.name,
      product.description,
      product.price.toFixed(2),
      product.stock.toString(),
      categories.find((c) => c.id === product.categoryId)?.name || "",
      suppliers.find((s) => s.id === product.supplierId)?.name || "",
    ]);

    doc.autoTable({
      head: productHeaders,
      body: productData,
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
    doc.save("inventory_report.pdf");
  };
  return (
    <div className="container mx-auto p-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "products" | "categories")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" /> Export to PDF
            </Button>
          </div>
          <ProductsTab
            products={filteredProducts}
            onEdit={(product: Product) => {
              setCurrentItem(product);
              setIsEditDialogOpen(true);
            }}
            onDelete={(product: Product) => {
              setCurrentItem(product);
              setIsDeleteDialogOpen(true);
            }}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab
            categories={categories}
            onEdit={(category: Category) => {
              setCurrentItem(category);
              setIsEditDialogOpen(true);
            }}
            onDelete={(category: Category) => {
              setCurrentItem(category);
              setIsDeleteDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Create{" "}
            {activeTab === "products" ? "Product" : "Category"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create {activeTab === "products" ? "Product" : "Category"}
            </DialogTitle>
          </DialogHeader>
          {activeTab === "products" ? (
            <ProductForm
              onSubmit={handleCreateProduct}
              categories={categories}
              suppliers={suppliers}
            />
          ) : (
            <CategoryForm onSubmit={handleCreate} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {activeTab === "products" ? "Product" : "Category"}
            </DialogTitle>
          </DialogHeader>
          {activeTab === "products" ? (
            <ProductForm
              onSubmit={handleUpdateProduct}
              initialData={currentItem as Product}
              categories={categories}
              suppliers={suppliers}
            />
          ) : (
            <CategoryForm
              onSubmit={handleUpdateCategory}
              initialData={currentItem as Category}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{" "}
              {activeTab === "products" ? "product" : "category"}? This action
              cannot be undone.
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
                handleDelete((currentItem as Product | Category).id!)
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

function ProductsTab({
  products,
  onEdit,
  onDelete,
  onSort,
  sortConfig,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSort: (key: keyof Product) => void;
  sortConfig: { key: keyof Product; direction: "asc" | "desc" } | null;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => onSort("name")} className="cursor-pointer">
            Name{" "}
            {sortConfig?.key === "name" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead
            onClick={() => onSort("description")}
            className="cursor-pointer"
          >
            Description{" "}
            {sortConfig?.key === "description" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead onClick={() => onSort("price")} className="cursor-pointer">
            Price{" "}
            {sortConfig?.key === "price" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead onClick={() => onSort("stock")} className="cursor-pointer">
            Stock{" "}
            {sortConfig?.key === "stock" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead
            onClick={() => onSort("categoryId")}
            className="cursor-pointer"
          >
            Category{" "}
            {sortConfig?.key === "categoryId" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead
            onClick={() => onSort("supplierId")}
            className="cursor-pointer"
          >
            Supplier{" "}
            {sortConfig?.key === "supplierId" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.description}</TableCell>
            <TableCell>{product.price.toFixed(2)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>{product.categoryId}</TableCell>
            <TableCell>{product.supplierId}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategoriesTab({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              {new Date(category.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              {new Date(category.updatedAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ProductForm({
  onSubmit,
  initialData = {} as Product,
  categories,
  suppliers,
}: {
  onSubmit: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Partial<Product>;
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    categoryId: initialData?.categoryId || "",
    supplierId: initialData?.supplierId || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price || ""}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stock" className="text-right">
            Stock
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock || ""}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoryId" className="text-right">
            Category
          </Label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleChange}
            className="col-span-3 p-2 border rounded"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="supplierId" className="text-right">
            Supplier
          </Label>
          <select
            id="supplierId"
            name="supplierId"
            value={formData.supplierId || ""}
            onChange={handleChange}
            className="col-span-3 p-2 border rounded"
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}

function CategoryForm({
  onSubmit,
  initialData = { name: "" },
}: {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Partial<Category>;
}) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData.name || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            value={formData.name}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}
