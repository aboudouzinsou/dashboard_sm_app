const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const url =
  process.env.DATABASE_URL || "mongodb://localhost:27017/your_database_name";
const dbName = url.split("/").pop().split("?")[0];

if (!url) {
  console.error(
    "DATABASE_URL is not defined. Please set it in your environment variables or .env file.",
  );
  process.exit(1);
}

console.log("Using database URL:", url);
console.log("Database name:", dbName);

async function main() {
  let client;

  try {
    client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Seed Settings
    const settingsCollection = db.collection("Settings");
    let settings = await settingsCollection.findOne();
    if (!settings) {
      settings = await settingsCollection.insertOne({
        storeName: "My Store",
        currency: "USD",
        timezone: "America/New_York",
        lowStockThreshold: 10,
        vatRate: 20,
      });
      console.log("Settings created:", settings.insertedId);
    } else {
      console.log("Settings already exist:", settings._id);
    }

    // Seed Users
    const usersCollection = db.collection("User");
    const adminPassword = await bcrypt.hash("admin123", 10);
    let admin = await usersCollection.findOne({ email: "admin@example.com" });
    if (!admin) {
      admin = await usersCollection.insertOne({
        email: "admin@example.com",
        name: "Admin User",
        password: adminPassword,
        role: "admin",
      });
      console.log("Admin user created:", admin.insertedId);
    } else {
      console.log("Admin user already exists:", admin._id);
    }

    // Seed additional users
    const additionalUsers = [
      { email: "manager@example.com", name: "Manager User", role: "manager" },
      { email: "seller@example.com", name: "Seller User", role: "seller" },
    ];

    for (const userData of additionalUsers) {
      let user = await usersCollection.findOne({ email: userData.email });
      if (!user) {
        const password = await bcrypt.hash("password123", 10);
        user = await usersCollection.insertOne({
          ...userData,
          password,
        });
        console.log(`${userData.role} user created:`, user.insertedId);
      } else {
        console.log(`${userData.role} user already exists:`, user._id);
      }
    }

    // Seed Categories
    const categoriesCollection = db.collection("Category");
    const categoryNames = [
      "Electronics",
      "Clothing",
      "Books",
      "Home & Garden",
      "Sports & Outdoors",
    ];
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        let category = await categoriesCollection.findOne({ name });
        if (!category) {
          category = await categoriesCollection.insertOne({ name });
          console.log(`Category created: ${name}`);
          return { id: category.insertedId, name };
        } else {
          console.log(`Category already exists: ${name}`);
          return { id: category._id, name };
        }
      }),
    );

    // Seed Suppliers
    const suppliersCollection = db.collection("Supplier");
    const supplierData = [
      {
        name: "Tech Supplies Inc.",
        contactInfo: {
          email: "contact@techsupplies.com",
          phone: "123-456-7890",
          address: "123 Tech St, Silicon Valley, CA",
        },
      },
      {
        name: "Fashion Wholesalers",
        contactInfo: {
          email: "info@fashionwholesalers.com",
          phone: "987-654-3210",
          address: "456 Fashion Ave, New York, NY",
        },
      },
      {
        name: "Book Depot",
        contactInfo: {
          email: "orders@bookdepot.com",
          phone: "555-123-4567",
          address: "789 Library Lane, Chicago, IL",
        },
      },
    ];

    const suppliers = await Promise.all(
      supplierData.map(async (data) => {
        let supplier = await suppliersCollection.findOne({ name: data.name });
        if (!supplier) {
          supplier = await suppliersCollection.insertOne(data);
          console.log(`Supplier created: ${data.name}`);
          return { id: supplier.insertedId, ...data };
        } else {
          console.log(`Supplier already exists: ${data.name}`);
          return { id: supplier._id, ...data };
        }
      }),
    );

    // Seed Products
    const productsCollection = db.collection("Product");
    const productData = [
      {
        name: "Smartphone X",
        description: "Latest model smartphone with advanced features",
        price: 699.99,
        stock: 50,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
      },
      {
        name: "Designer T-Shirt",
        description: "High-quality cotton t-shirt with trendy design",
        price: 29.99,
        stock: 100,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
      },
      {
        name: "Bestseller Novel",
        description: "Top-rated fiction novel of the year",
        price: 14.99,
        stock: 75,
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
      },
      {
        name: "Wireless Earbuds",
        description: "High-quality sound with long battery life",
        price: 89.99,
        stock: 30,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
      },
      {
        name: "Garden Tool Set",
        description: "Complete set of essential garden tools",
        price: 49.99,
        stock: 25,
        categoryId: categories[3].id,
        supplierId: suppliers[1].id,
      },
    ];

    const products = await Promise.all(
      productData.map(async (data) => {
        let product = await productsCollection.findOne({ name: data.name });
        if (!product) {
          product = await productsCollection.insertOne(data);
          console.log(`Product created: ${data.name}`);
          return { id: product.insertedId, ...data };
        } else {
          console.log(`Product already exists: ${data.name}`);
          return { id: product._id, ...data };
        }
      }),
    );

    // Seed Sales
    const salesCollection = db.collection("Sale");
    const saleData = [
      {
        employeeId: admin._id || admin.insertedId,
        total: 729.98,
        items: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
          },
        ],
      },
      {
        employeeId: admin._id || admin.insertedId,
        total: 104.98,
        items: [
          {
            productId: products[2].id,
            quantity: 2,
            price: products[2].price,
          },
          {
            productId: products[1].id,
            quantity: 2,
            price: products[1].price,
          },
        ],
      },
    ];

    for (const sale of saleData) {
      const existingSale = await salesCollection.findOne({
        employeeId: sale.employeeId,
        total: sale.total,
      });

      if (!existingSale) {
        const newSale = await salesCollection.insertOne(sale);
        console.log("Sale created:", newSale.insertedId);
      } else {
        console.log("Sale already exists");
      }
    }

    // Seed RestockOrders
    const restockOrdersCollection = db.collection("RestockOrder");
    const restockOrderData = [
      {
        supplierId: suppliers[0].id,
        items: [
          {
            productId: products[0].id,
            quantityOrdered: 20,
            quantityReceived: 0,
            status: "Pending",
          },
          {
            productId: products[3].id,
            quantityOrdered: 15,
            quantityReceived: 0,
            status: "Pending",
          },
        ],
        orderDate: new Date(),
        status: "Pending",
      },
      {
        supplierId: suppliers[1].id,
        items: [
          {
            productId: products[1].id,
            quantityOrdered: 50,
            quantityReceived: 0,
            status: "Pending",
          },
          {
            productId: products[4].id,
            quantityOrdered: 10,
            quantityReceived: 0,
            status: "Pending",
          },
        ],
        orderDate: new Date(),
        status: "Pending",
      },
    ];

    for (const order of restockOrderData) {
      const existingOrder = await restockOrdersCollection.findOne({
        supplierId: order.supplierId,
        orderDate: order.orderDate,
      });

      if (!existingOrder) {
        const newOrder = await restockOrdersCollection.insertOne(order);
        console.log("RestockOrder created:", newOrder.insertedId);
      } else {
        console.log("RestockOrder already exists");
      }
    }

    // Seed Receiving
    const receivingCollection = db.collection("Receiving");
    const receivingData = [
      {
        restockOrderId: (await restockOrdersCollection.findOne())._id,
        receivedById: admin._id || admin.insertedId,
        dateReceived: new Date(),
        items: [
          {
            productId: products[0].id,
            quantityReceived: 10,
          },
        ],
        status: "Partially Received",
      },
    ];

    for (const receiving of receivingData) {
      const existingReceiving = await receivingCollection.findOne({
        restockOrderId: receiving.restockOrderId,
        dateReceived: receiving.dateReceived,
      });

      if (!existingReceiving) {
        const newReceiving = await receivingCollection.insertOne(receiving);
        console.log("Receiving created:", newReceiving.insertedId);
      } else {
        console.log("Receiving already exists");
      }
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("An error occurred during seeding:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("Disconnected from MongoDB");
    }
  }
}

main().catch(console.error);
