# Pawtectors Backend API Documentation

## Overview

The Pawtectors backend is a Node.js/Express server that provides RESTful APIs for managing:
- Pet products and e-commerce
- Service bookings (clinics, grooming, boarding, training)
- User authentication and profiles
- Payments via Razorpay
- Reviews and ratings
- NGO/Animal shelter management
- Adoption requests and donations

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account with project created
- Razorpay account for payment processing
- Environment variables configured

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Update .env with your credentials
```

### Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Access
# User with this email will have admin privileges (see all orders/bookings)
ADMIN_EMAIL=admin@pawtectors.com
```

**Admin Access:**
- Set `ADMIN_EMAIL` to the email address that should have admin privileges
- Admins can view ALL orders and bookings from all users
- Regular users only see their own orders and bookings
- For development: use `admin@pawtectors.com` / `pawtectors123` for the default system admin

### Running the Server

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will be available at `http://localhost:5000`

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-02-07T10:30:00.000Z"
}
```

---

## Products API

### List Products
```http
GET /products?category=food
```

**Query Parameters:**
- `category` (optional): Filter by category (food, toys, accessories, grooming, health, clothing, medicine)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Pedigree Adult Dog Food",
    "price": 1299,
    "category": "food",
    "stock": 50,
    "rating": 4.5,
    "reviewCount": 128,
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
]
```

### Get Product Details
```http
GET /products/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Pedigree Adult Dog Food",
  "description": "Complete nutrition for adult dogs",
  "price": 1299,
  "category": "food",
  "image": "https://...",
  "stock": 50,
  "brand": "Pedigree",
  "rating": 4.5,
  "reviewCount": 128,
  "createdAt": "2024-02-07T10:00:00.000Z"
}
```

### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 999,
  "category": "food",
  "image": "https://...",
  "stock": 25,
  "brand": "Brand Name"
}
```

### Update Product (Admin Only)
```http
PUT /products/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "stock": 30,
  "rating": 4.6
}
```

### Delete Product (Admin Only)
```http
DELETE /products/:id
Authorization: Bearer <jwt_token>
```

---

## Orders API

### List User Orders
```http
GET /orders
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "customerId": "user_uuid",
    "totalAmount": 3000,
    "status": "delivered",
    "paymentStatus": "paid",
    "shippingAddress": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "Bangalore",
      "pincode": "560001"
    },
    "items": [
      {
        "productId": "uuid",
        "quantity": 2,
        "price": 1299
      }
    ],
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
]
```

### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <jwt_token>
```

### Create Order
```http
POST /orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 1299
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St",
    "pincode": "560001"
  },
  "totalAmount": 2598
}
```

### Update Order Status (Admin Only)
```http
PUT /orders/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "paid"
}
```

---

## Bookings API

### List Bookings
```http
GET /bookings?providerId=uuid
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `providerId` (optional): Filter by service provider
- `customerId` (optional): Filter by customer

**Response:**
```json
[
  {
    "id": "uuid",
    "providerId": "uuid",
    "petName": "Buddy",
    "petType": "dog",
    "ownerName": "John Doe",
    "bookingDate": "2024-02-10",
    "bookingTime": "10:00",
    "status": "confirmed",
    "amount": 500,
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
]
```

### Get Booking Details
```http
GET /bookings/:id
Authorization: Bearer <jwt_token>
```

### Create Booking
```http
POST /bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "providerId": "uuid",
  "servicePricingId": "uuid",
  "petName": "Buddy",
  "petType": "dog",
  "ownerName": "John Doe",
  "ownerEmail": "john@example.com",
  "ownerPhone": "9876543210",
  "bookingDate": "2024-02-10",
  "bookingTime": "10:00",
  "notes": "Friendly dog, allergic to chicken",
  "amount": 500
}
```

### Update Booking (Provider/Admin)
```http
PUT /bookings/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

---

## Reviews API

### List Reviews
```http
GET /reviews?productId=uuid
```

**Query Parameters:**
- `productId` (optional): Get reviews for a product
- `serviceProviderId` (optional): Get reviews for a service provider

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user_uuid",
    "productId": "uuid",
    "rating": 5,
    "comment": "Great product! Highly recommended.",
    "isVerifiedPurchase": true,
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
]
```

### Create Review
```http
POST /reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "productId": "uuid",
  "rating": 5,
  "comment": "Great product! Highly recommended.",
  "orderId": "uuid"
}
```

### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good product"
}
```

### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <jwt_token>
```

---

## Payments API

### Create Payment Order
```http
POST /payments/order
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 2598,
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "id": "payment_uuid",
  "razorpayOrderId": "order_id_from_razorpay",
  "amount": 2598,
  "currency": "INR",
  "status": "pending"
}
```

### Verify Payment
```http
POST /payments/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "paymentId": "payment_uuid",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

---

## NGO/Adoption API

### List NGOs
```http
GET /ngos
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Bangalore Animal Shelter",
    "city": "Bangalore",
    "rating": 4.8,
    "animalsCount": 45,
    "isVerified": true,
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
]
```

### Get Shelter Animals
```http
GET /ngos/:ngoId/animals
```

### Create Adoption Request
```http
POST /adoption-requests
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "animalId": "uuid",
  "ngoId": "uuid"
}
```

### Make Donation
```http
POST /donations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "ngoId": "uuid",
  "amount": 1000,
  "donationType": "monetary"
}
```

---

## Authentication

### Headers
All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Getting JWT Token
After user signs up/logs in with Supabase Auth, get the session token:

```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use in API calls
fetch('http://localhost:5000/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Error Handling

All errors return appropriate HTTP status codes:

```json
{
  "error": "Error message describing the issue"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

---

## Rate Limiting

Implement rate limiting in production:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Deployment

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use production Supabase project
3. Enable HTTPS
4. Set up proper CORS headers
5. Use strong JWT secret
6. Configure Razorpay production keys

### Deployment Platforms
- **Vercel**: `vercel deploy`
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS/Azure**: Use their Node.js deployment guides

---

## Testing

```bash
# Using curl
curl http://localhost:5000/health

# Using postman
Import the postman_collection.json file

# Using client SDK
import { supabase } from '@supabase/supabase-js'
```

---

## Troubleshooting

### Common Issues

1. **"Invalid token" error**
   - Ensure token is valid and not expired
   - Check JWT_SECRET matches between frontend and backend

2. **CORS errors**
   - Verify FRONTEND_URL in .env matches your frontend URL
   - Check CORS middleware configuration

3. **Database connection error**
   - Verify SUPABASE_URL and SUPABASE_KEY
   - Check if Supabase project is active

4. **Razorpay payment fails**
   - Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
   - Check if using test vs production keys

