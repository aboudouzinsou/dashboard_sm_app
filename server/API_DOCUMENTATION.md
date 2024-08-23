# Store Management API Documentation

## Base URL

All endpoints are relative to: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Endpoints

### Users

#### Register a new user

- **POST** `/users/register`
- **Auth required:** Yes (Admin only)
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "seller"
  }
  ```
- **Success Response:** `201 Created`

#### User Login

- **POST** `/users/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "seller"
    },
    "token": "JWT_TOKEN"
  }
  ```

#### Get User

- **GET** `/users/:id`
- **Auth required:** Yes (Admin and Manager)
- **Success Response:** `200 OK`

#### Update User

- **PUT** `/users/:id`
- **Auth required:** Yes (Admin only)
- **Body:** (all fields optional)
  ```json
  {
    "name": "Updated Name",
    "role": "manager"
  }
  ```
- **Success Response:** `200 OK`

#### Delete User

- **DELETE** `/users/:id`
- **Auth required:** Yes (Admin only)
- **Success Response:** `200 OK`

### Products

#### Create Product

- **POST** `/products`
- **Auth required:** Yes (Admin and Manager)
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product Description",
    "price": 19.99,
    "stock": 100,
    "categoryId": "category_id",
    "supplierId": "supplier_id"
  }
  ```
- **Success Response:** `201 Created`

#### Get All Products

- **GET** `/products`
- **Auth required:** Yes
- **Success Response:** `200 OK`

#### Get Product

- **GET** `/products/:id`
- **Auth required:** Yes
- **Success Response:** `200 OK`

#### Update Product

- **PUT** `/products/:id`
- **Auth required:** Yes (Admin and Manager)
- **Body:** (all fields optional)
  ```json
  {
    "name": "Updated Product Name",
    "price": 24.99,
    "stock": 150
  }
  ```
- **Success Response:** `200 OK`

#### Delete Product

- **DELETE** `/products/:id`
- **Auth required:** Yes (Admin only)
- **Success Response:** `200 OK`

#### Get Low Stock Products

- **GET** `/products/low-stock`
- **Auth required:** Yes (Admin and Manager)
- **Query Parameters:** `threshold` (optional, default is 10)
- **Success Response:** `200 OK`

### Categories

#### Create Category

- **POST** `/categories`
- **Auth required:** Yes (Admin and Manager)
- **Body:**
  ```json
  {
    "name": "Category Name"
  }
  ```
- **Success Response:** `201 Created`

#### Get All Categories

- **GET** `/categories`
- **Auth required:** Yes
- **Success Response:** `200 OK`

#### Get Category

- **GET** `/categories/:id`
- **Auth required:** Yes
- **Success Response:** `200 OK`

#### Update Category

- **PUT** `/categories/:id`
- **Auth required:** Yes (Admin and Manager)
- **Body:**
  ```json
  {
    "name": "Updated Category Name"
  }
  ```
- **Success Response:** `200 OK`

#### Delete Category

- **DELETE** `/categories/:id`
- **Auth required:** Yes (Admin only)
- **Success Response:** `200 OK`

### Sales

#### Create Sale

- **POST** `/sales`
- **Auth required:** Yes
- **Body:**
  ```json
  {
    "items": [
      {
        "productId": "product_id",
        "quantity": 2
      }
    ]
  }
  ```
- **Success Response:** `201 Created`

#### Get All Sales

- **GET** `/sales`
- **Auth required:** Yes (Admin and Manager)
- **Success Response:** `200 OK`

#### Get Sale

- **GET** `/sales/:id`
- **Auth required:** Yes (Admin and Manager)
- **Success Response:** `200 OK`

#### Get Daily Sales Report

- **GET** `/sales/daily-report`
- **Auth required:** Yes (Admin and Manager)
- **Query Parameters:** `date` (optional, default is current date)
- **Success Response:** `200 OK`

### Restock Orders

#### Create Restock Order

- **POST** `/restock-orders`
- **Auth required:** Yes (Admin and Manager)
- **Body:**
  ```json
  {
    "supplierId": "supplier_id",
    "items": [
      {
        "productId": "product_id",
        "quantityOrdered": 50
      }
    ]
  }
  ```
- **Success Response:** `201 Created`

#### Get All Restock Orders

- **GET** `/restock-orders`
- **Auth required:** Yes (Admin and Manager)
- **Success Response:** `200 OK`

#### Get Restock Order

- **GET** `/restock-orders/:id`
- **Auth required:** Yes (Admin and Manager)
- **Success Response:** `200 OK`

#### Update Restock Order

- **PUT** `/restock-orders/:id`
- **Auth required:** Yes (Admin and Manager)
- **Body:**
  ```json
  {
    "status": "Partially Received",
    "items": [
      {
        "productId": "product_id",
        "quantityReceived": 30
      }
    ]
  }
  ```
- **Success Response:** `200 OK`

#### Delete Restock Order

- **DELETE** `/restock-orders/:id`
- **Auth required:** Yes (Admin only)
- **Success Response:** `200 OK`

### Reports

#### Get Sales Report

- **GET** `/reports/sales`
- **Auth required:** Yes (Admin and Manager)
- **Query Parameters:**
  - `startDate`: Start date for the report (YYYY-MM-DD)
  - `endDate`: End date for the report (YYYY-MM-DD)
- **Success Response:** `200 OK`

#### Get Top Selling Products

- **GET** `/reports/top-selling`
- **Auth required:** Yes (Admin and Manager)
- **Query Parameters:** `limit` (optional, default is 10)
- **Success Response:** `200 OK`

#### Get Low Stock Products Report

- **GET** `/reports/low-stock`
- **Auth required:** Yes (Admin and Manager)
- **Query Parameters:** `threshold` (optional, default is from settings)
- **Success Response:** `200 OK`

### Settings

#### Get Settings

- **GET** `/settings`
- **Auth required:** Yes
- **Success Response:** `200 OK`

#### Update Settings

- **PUT** `/settings`
- **Auth required:** Yes (Admin only)
- **Body:** (all fields optional)
  ```json
  {
    "storeName": "New Store Name",
    "currency": "EUR",
    "timezone": "Europe/Paris",
    "lowStockThreshold": 15,
    "vatRate": 20
  }
  ```
- **Success Response:** `200 OK`

## Error Responses

- **400 Bad Request:** The request was invalid or cannot be served.
- **401 Unauthorized:** The request requires authentication.
- **403 Forbidden:** The server understood the request but refuses to authorize it.
- **404 Not Found:** The requested resource could not be found.
- **422 Unprocessable Entity:** The request was well-formed but was unable to be followed due to semantic errors.
- **500 Internal Server Error:** The server encountered an unexpected condition which prevented it from fulfilling the request.

## Rate Limiting

To prevent abuse, API calls are limited to 100 requests per IP address per hour.

## Changelog

- **v1.0.0** (2023-08-23): Initial release of the API.
