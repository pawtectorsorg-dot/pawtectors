import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
} from '../controllers/orderController.js';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
} from '../controllers/bookingController.js';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import {
  getPayments,
  createPaymentOrder,
  verifyPayment,
} from '../controllers/paymentController.js';
import { authenticateToken, optionalAuth, demoAuth } from '../middleware/auth.js';

// NOTE: During investor demo phase, all routes use demoAuth instead of
// authenticateToken. Swap back when adding real security.

const router = express.Router();

// Products
router.get('/products', demoAuth, getProducts);
router.get('/products/:id', demoAuth, getProductById);
router.post('/products', demoAuth, createProduct);
router.put('/products/:id', demoAuth, updateProduct);
router.delete('/products/:id', demoAuth, deleteProduct);

// Orders
router.get('/orders', demoAuth, getOrders);
router.get('/orders/:id', demoAuth, getOrderById);
router.post('/orders', demoAuth, createOrder);
router.put('/orders/:id', demoAuth, updateOrder);

// Bookings
router.get('/bookings', demoAuth, getBookings);
router.get('/bookings/:id', demoAuth, getBookingById);
router.post('/bookings', demoAuth, createBooking);
router.put('/bookings/:id', demoAuth, updateBooking);

// Reviews
router.get('/reviews', demoAuth, getReviews);
router.get('/reviews/:id', demoAuth, getReviewById);
router.post('/reviews', demoAuth, createReview);
router.put('/reviews/:id', demoAuth, updateReview);
router.delete('/reviews/:id', demoAuth, deleteReview);

// Payments
router.get('/payments', demoAuth, getPayments);
router.post('/payments/order', demoAuth, createPaymentOrder);
router.post('/payments/verify', demoAuth, verifyPayment);

export default router;
