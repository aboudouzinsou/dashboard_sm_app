const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const saleRoutes = require("./routes/saleRoutes");
const receivingRoutes = require("./routes/receivingRoutes");
const restockOrderRoutes = require("./routes/restockOrderRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/receivings", receivingRoutes);
app.use("/api/restock-orders", restockOrderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
