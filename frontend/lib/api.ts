const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

import {
  User,
  Product,
  Category,
  Supplier,
  Settings,
  SaleItem,
  Sale,
  CreateSaleData,
  Receiving,
  ReceivedItem,
  RestockOrder,
} from "@/types";

export const supplierApi = {
  getSuppliers: async () => {
    return apiFetch<Supplier[]>("/suppliers", { method: "GET" });
  },

  getSupplierById: async (id: string) => {
    return apiFetch<Supplier>(`/suppliers/${id}`, { method: "GET" });
  },

  createSupplier: async (
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
  ) => {
    return apiFetch<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  },

  updateSupplier: async (
    id: string,
    supplierData: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>,
  ) => {
    return apiFetch<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  },

  deleteSupplier: async (id: string) => {
    return apiFetch<void>(`/suppliers/${id}`, { method: "DELETE" });
  },
};

export const productApi = {
  getAll: async () => {
    console.log("Fetching all products...");
    return apiFetch<Product[]>("/products/active", { method: "GET" });
  },

  create: async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    console.log("Creating product with data:", data);
    return apiFetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Product>) => {
    console.log(`Updating product with ID: ${id}`, data);
    return apiFetch<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    console.log(`Deleting product with ID: ${id}`);
    return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
  },
};

export const settingsApi = {
  fetchSettings: async () => {
    return apiFetch<Settings>("/settings", { method: "GET" });
  },

  updateSettings: async (settings: Settings) => {
    return apiFetch<Settings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};

export const categoryApi = {
  getAll: async () => {
    console.log("Fetching all categories...");
    return apiFetch<Category[]>("/categories", { method: "GET" });
  },

  create: async (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    console.log("Creating category with data:", data);
    return apiFetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Category>) => {
    console.log(`Updating category with ID: ${id}`, data);
    return apiFetch<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    console.log(`Deleting category with ID: ${id}`);
    return apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
  },
};

export const inventoryApi = {
  // Méthodes pour les commandes de réapprovisionnement
  fetchRestockOrders: async () => {
    return apiFetch<RestockOrder[]>("/restock-orders", { method: "GET" });
  },

  createRestockOrder: async (data: Partial<RestockOrder>) => {
    return apiFetch<RestockOrder>("/restock-orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRestockOrder: async (id: string, data: Partial<RestockOrder>) => {
    return apiFetch<RestockOrder>(`/restock-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteRestockOrder: async (id: string) => {
    return apiFetch<void>(`/restock-orders/${id}`, { method: "DELETE" });
  },

  // Méthodes pour les réceptions
  fetchReceivings: async () => {
    return apiFetch<Receiving[]>("/receivings", { method: "GET" });
  },

  createReceiving: async (data: Partial<Receiving>) => {
    return apiFetch<Receiving>("/receivings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateReceiving: async (id: string, data: Partial<Receiving>) => {
    return apiFetch<Receiving>(`/receivings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteReceiving: async (id: string) => {
    return apiFetch<void>(`/receivings/${id}`, { method: "DELETE" });
  },

  // Méthode pour récupérer les produits actifs (déjà existante, mais ajoutée ici pour complétion)
  fetchProducts: async () => {
    return apiFetch<Product[]>("/products/active", { method: "GET" });
  },

  // Méthode pour récupérer les fournisseurs (déjà existante dans supplierApi, mais ajoutée ici pour cohérence)
  fetchSuppliers: async () => {
    return apiFetch<Supplier[]>("/suppliers", { method: "GET" });
  },
};

export const userApi = {
  getUsers: async () => {
    return apiFetch<User[]>("/users", { method: "GET" });
  },

  getUserById: async (id: string) => {
    return apiFetch<User>(`/users/${id}`, { method: "GET" });
  },

  createUser: async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ) => {
    return apiFetch<User>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (
    id: string,
    userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
  ) => {
    return apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
  },
};

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorDetails = await res.json();
    console.error("Error details:", errorDetails);
    throw new Error(errorDetails.message || "An error occurred");
  }

  return res.json();
}

export const posApi = {
  fetchProducts: async () =>
    apiFetch<Product[]>("/products/active", { method: "GET" }),
  fetchSettings: async () => apiFetch<Settings>("/settings", { method: "GET" }),
  saveSale: async (saleData: {
    items: { productId: string; quantity: number; price: number }[];
    total: number;
    vatAmount: number;
    subtotal: number;
    employeeId: string;
  }) => {
    return apiFetch<void>("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },
};

export const saleApi = {
  createSale: async (saleItems: Omit<SaleItem, "name">[]) => {
    return apiFetch<void>("/sales", {
      method: "POST",
      body: JSON.stringify({ items: saleItems }),
    });
  },

  getSales: async () => {
    return apiFetch<Sale[]>("/sales", { method: "GET" });
  },

  getSale: async (id: string) => {
    return apiFetch<Sale>(`/sales/${id}`, { method: "GET" });
  },

  getDailySalesReport: async (id: string) => {
    return apiFetch<Sale[]>(`/sales/${id}`, { method: "GET" }); // Adjust endpoint if needed
  },

  fetchSalesByDateRange: async (
    startDate: string,
    endDate: string,
  ): Promise<Sale[]> => {
    // Construct the URL with query parameters for date range
    const url = `/sales?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    // Fetch data from the API
    return apiFetch<Sale[]>(url, { method: "GET" });
  },

  deleteSale: async (id: string) => {
    return apiFetch<void>(`/sales/${id}`, { method: "DELETE" });
  },
};

export const reportApi = {
  getSalesReport: async (
    startDate: string,
    endDate: string,
  ): Promise<Sale[]> => {
    console.log("Fetching sales report...");
    const url = `/reports/sales?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    return apiFetch<Sale[]>(url, { method: "GET" });
  },

  getTopSellingProducts: async (limit: number = 5): Promise<Product[]> => {
    console.log("Fetching top selling products...");
    return apiFetch<Product[]>(`/reports/top-selling?limit=${limit}`, {
      method: "GET",
    });
  },

  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    console.log("Fetching low stock products...");
    return apiFetch<Product[]>(`/reports/low-stock?threshold=${threshold}`, {
      method: "GET",
    });
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    console.log("Logging in with email:", email);
    return apiFetch<{ user: User; token: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    console.log("Registering user with data:", userData);
    return apiFetch<{ userId: string }>("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getUserProfile: async (token: string) => {
    console.log("Fetching user profile with token:", token);
    return apiFetch<User>("/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  logout: () => {
    console.log("Logging out");
    localStorage.removeItem("token");
  },
};
