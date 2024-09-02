import "jspdf";

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleData {
  items: Omit<SaleItem, "id" | "saleId">[];
  employeeId: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: SaleItem[];
  employeeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestockOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  orderDate: string;
  receivedDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receiving {
  id: string;
  restockOrderId: string;
  receivedById: string;
  dateReceived: string;
  items: ReceivedItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  storeName: string;
  timezone: string;
  currency: string;
  lowStockThreshold: number;
  vatRate: number;
  createdAt?: string;
  updatedAt: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrderItem {
  id: string;
  restockOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  status: string;
}

export interface ReceivedItem {
  id: string;
  receivingId: string;
  productId: string;
  quantityReceived: number;
}

export interface OrderItem {
  id: string;
  restockOrderId: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  status: string;
}

export interface RestockOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  orderDate: string;
  receivedDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivedItem {
  id: string;
  receivingId: string;
  productId: string;
  quantityReceived: number;
}

export interface Receiving {
  id: string;
  restockOrderId: string;
  receivedById: string;
  dateReceived: string;
  items: ReceivedItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

declare module "jspdf" {
  export interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}
