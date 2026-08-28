import express, { Router } from 'express';
import { authenticateToken, requireRole, optionalAuth, demoAuth, demoRole } from '../middleware/auth.js';
import { tenantGuard, injectClinicId } from '../middleware/tenantGuard.js';

// NOTE: During investor demo phase, all routes use demoAuth/demoRole instead of
// authenticateToken/requireRole. Swap back when adding real security.
import {
  userController,
  providerController,
  bookingController,
  productController,
  orderController,
  reviewController,
  paymentController,
  ngoController,
  notificationController,
  clinicController,
  petTypeController,
  petController,
  legalPageController,
  cartController,
  medicalRecordController,
  vaccinationController,
  timeSlotController,
  billController,
  clinicSettingsController,
  clinicPetParentsController,
  adminStatsController,
  clinicScopedController,
} from '../controllers/apiControllers.js';

const router = Router();

// ============================================================================
// USER ROUTES
// ============================================================================

router.get('/user/profile', demoAuth, (req, res) => userController.getProfile(req, res));
router.get('/user/profile-by-email', (req, res) => userController.getProfileByEmail(req, res)); // No auth required for login flow
router.put('/user/profile', demoAuth, (req, res) => userController.updateProfile(req, res));
router.get('/user/roles', demoAuth, (req, res) => userController.getRoles(req, res));

// Pet Profile CRUD
router.get('/pets', demoAuth, (req, res) => petController.getMyPets(req, res));
router.post('/pets', demoAuth, (req, res) => petController.createPet(req, res));
router.put('/pets/:id', demoAuth, (req, res) => petController.updatePet(req, res));
router.delete('/pets/:id', demoAuth, (req, res) => petController.deletePet(req, res));

router.get('/admin/users', demoAuth, demoRole(['admin']), (req, res) => userController.getAll(req, res));
router.delete('/admin/users/:id', demoAuth, demoRole(['admin']), (req, res) => userController.delete(req, res));
router.put('/admin/users/:id', demoAuth, demoRole(['admin']), (req, res) => userController.updateUserById(req, res));
router.post('/admin/users/:id/assign-role', demoAuth, demoRole(['admin']), (req, res) => userController.assignRole(req, res));
router.post('/admin/providers', demoAuth, demoRole(['admin']), (req, res) => providerController.createWithAccount(req, res));


// ============================================================================
// PROVIDER ROUTES
// ============================================================================

router.post('/providers', optionalAuth, (req, res) => providerController.create(req, res));
router.get('/providers', optionalAuth, (req, res) => providerController.getAll(req, res));
router.get('/providers/:id', optionalAuth, (req, res) => providerController.getById(req, res));
router.put('/providers/:id', optionalAuth, (req, res) => providerController.update(req, res));
router.delete('/providers/:id', optionalAuth, (req, res) => providerController.delete(req, res));
router.get('/pet-types', (req, res) => petTypeController.getAll(req, res));
router.post('/pet-types', demoAuth, demoRole(['admin']), (req, res) => petTypeController.create(req, res));
// ============================================================================
// BOOKING ROUTES
// ============================================================================

router.post('/bookings', optionalAuth, (req, res) => bookingController.create(req, res));
router.get('/bookings', optionalAuth, (req, res) => bookingController.getAll(req, res));
router.get('/bookings/:id', optionalAuth, (req, res) => bookingController.getById(req, res));
router.put('/bookings/:id', optionalAuth, (req, res) => bookingController.update(req, res));
router.post('/bookings/:id/cancel', optionalAuth, (req, res) => bookingController.cancel(req, res));

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

router.post('/products', demoAuth, demoRole(['admin']), (req, res) =>
  productController.create(req, res)
);
router.get('/products', demoAuth, (req, res) => productController.getAll(req, res));
router.get('/products/:id', demoAuth, (req, res) => productController.getById(req, res));
router.put('/products/:id', demoAuth, demoRole(['admin']), (req, res) =>
  productController.update(req, res)
);
router.delete('/products/:id', demoAuth, demoRole(['admin']), (req, res) =>
  productController.delete(req, res)
);

// ============================================================================
// ORDER ROUTES
// ============================================================================

router.post('/orders', demoAuth, (req, res) => orderController.create(req, res));
router.get('/orders', demoAuth, (req, res) => orderController.getAll(req, res));
router.get('/orders/:id', demoAuth, (req, res) => orderController.getById(req, res));
router.put('/orders/:id', demoAuth, (req, res) => orderController.update(req, res));
router.post('/orders/:orderId/items', demoAuth, (req, res) => orderController.addItem(req, res));
router.post('/orders/:orderId/send-email', demoAuth, (req, res) => orderController.sendOrderEmail(req, res));

// ============================================================================
// REVIEW ROUTES
// ============================================================================

router.post('/reviews', demoAuth, (req, res) => reviewController.create(req, res));
router.get('/reviews', demoAuth, (req, res) => reviewController.getAll(req, res));
router.put('/reviews/:id', demoAuth, (req, res) => reviewController.update(req, res));
router.delete('/reviews/:id', demoAuth, (req, res) => reviewController.delete(req, res));

// ============================================================================
// PAYMENT ROUTES
// ============================================================================

router.post('/payments', demoAuth, (req, res) => paymentController.create(req, res));
router.get('/payments', demoAuth, (req, res) => paymentController.getAll(req, res));
router.post('/payments/verify', demoAuth, (req, res) => paymentController.verify(req, res));

// ============================================================================
// NGO ROUTES
// ============================================================================

router.post('/ngos', demoAuth, demoRole(['admin']), (req, res) => ngoController.create(req, res));
router.get('/ngos', demoAuth, (req, res) => ngoController.getAll(req, res));
router.get('/ngos/:id', demoAuth, (req, res) => ngoController.getById(req, res));
router.put('/ngos/:id', demoAuth, demoRole(['admin']), (req, res) => ngoController.update(req, res));

router.post('/ngos/:id/animals', demoAuth, (req, res) => ngoController.addAnimal(req, res));
router.get('/ngos/:id/animals', demoAuth, (req, res) => ngoController.getAnimals(req, res));

router.post('/ngos/:id/adoptions', demoAuth, (req, res) =>
  ngoController.requestAdoption(req, res)
);
router.post('/ngos/:id/donations', demoAuth, (req, res) => ngoController.donate(req, res));

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================
router.get('/notifications', demoAuth, (req, res) => notificationController.getAll(req, res));
router.post('/notifications', demoAuth, (req, res) => notificationController.create(req, res));
router.post('/notifications/:id/read', demoAuth, (req, res) =>
  notificationController.markAsRead(req, res)
);

// ============================================================================
// CLINIC ROUTES - Specialized clinic management
// ============================================================================

// Clinic CRUD operations
router.post('/clinics', demoAuth, demoRole(['provider']), (req, res) =>
  clinicController.create(req, res)
);
router.get('/clinics', optionalAuth, (req, res) => clinicController.getAll(req, res));
router.get('/clinics/search/location', optionalAuth, (req, res) =>
  clinicController.searchByLocation(req, res)
);
router.get('/clinics/search/specialization', optionalAuth, (req, res) =>
  clinicController.searchBySpecialization(req, res)
);
router.get('/clinics/:id', optionalAuth, (req, res) => clinicController.getById(req, res));
router.put('/clinics/:id', demoAuth, (req, res) => clinicController.update(req, res));
router.delete('/clinics/:id', demoAuth, (req, res) => clinicController.delete(req, res));
router.post('/clinics/:id/verify', demoAuth, demoRole(['admin']), (req, res) =>
  clinicController.verify(req, res)
);

// Clinic Staff management
router.post('/clinics/:id/staff', demoAuth, (req, res) => clinicController.addStaff(req, res));
router.get('/clinics/:id/staff', demoAuth, (req, res) => clinicController.getStaff(req, res));
router.put('/clinics/:id/staff/:staffId', demoAuth, (req, res) =>
  clinicController.updateStaff(req, res)
);
router.delete('/clinics/:id/staff/:staffId', demoAuth, (req, res) =>
  clinicController.deleteStaff(req, res)
);

// Clinic Equipment management
router.post('/clinics/:id/equipment', demoAuth, (req, res) =>
  clinicController.addEquipment(req, res)
);
router.get('/clinics/:id/equipment', demoAuth, (req, res) =>
  clinicController.getEquipment(req, res)
);
router.put('/clinics/:id/equipment/:equipmentId', demoAuth, (req, res) =>
  clinicController.updateEquipment(req, res)
);

// Clinic Services management
router.post('/clinics/:id/services', demoAuth, (req, res) =>
  clinicController.addService(req, res)
);
router.get('/clinics/:id/services', demoAuth, (req, res) =>
  clinicController.getServices(req, res)
);
router.put('/clinics/:id/services/:serviceId', demoAuth, (req, res) =>
  clinicController.updateService(req, res)
);
router.delete('/clinics/:id/services/:serviceId', demoAuth, (req, res) =>
  clinicController.deleteService(req, res)
);

// ============================================================================
// CART ROUTES
// ============================================================================

router.get('/cart', demoAuth, (req, res) => cartController.getCart(req, res));
router.post('/cart', demoAuth, (req, res) => cartController.upsertItem(req, res));
router.delete('/cart/:productId', demoAuth, (req, res) => cartController.removeItem(req, res));
router.delete('/cart', demoAuth, (req, res) => cartController.clearCart(req, res));

// Legal/policy pages — Privacy, Terms, Cookie, Cancellation & Refund.
// Anyone can read; only an admin can edit the content.
router.get('/legal-pages', (req, res) => legalPageController.getAll(req, res));
router.get('/legal-pages/:slug', (req, res) => legalPageController.getBySlug(req, res));
router.put('/legal-pages/:slug', demoAuth, demoRole(['admin']), (req, res) => legalPageController.update(req, res));

// ============================================================================
// MEDICAL RECORD ROUTES
// ============================================================================
router.get('/medical-records', demoAuth, (req, res) => medicalRecordController.getMedicalRecords(req, res));
router.get('/medical-records/:id', demoAuth, (req, res) => medicalRecordController.getMedicalRecord(req, res));
router.post('/medical-records', demoAuth, (req, res) => medicalRecordController.createMedicalRecord(req, res));
router.put('/medical-records/:id', demoAuth, (req, res) => medicalRecordController.updateMedicalRecord(req, res));

// ============================================================================
// VACCINATION ROUTES
// ============================================================================
router.get('/vaccinations', demoAuth, (req, res) => vaccinationController.getVaccinations(req, res));
router.post('/vaccinations', demoAuth, (req, res) => vaccinationController.createVaccination(req, res));

// ============================================================================
// TIME SLOT ROUTES
// ============================================================================
router.get('/time-slots', demoAuth, (req, res) => timeSlotController.getTimeSlots(req, res));
router.post('/time-slots/bulk', demoAuth, (req, res) => timeSlotController.bulkCreateTimeSlots(req, res));
router.post('/time-slots/toggle', demoAuth, (req, res) => timeSlotController.toggleTimeSlot(req, res));

// ============================================================================
// BILL ROUTES
// ============================================================================
router.get('/bills', demoAuth, (req, res) => billController.getBills(req, res));
router.get('/bills/:id', demoAuth, (req, res) => billController.getBill(req, res));
router.post('/bills', demoAuth, injectClinicId, (req, res) => billController.createBill(req, res));
router.put('/bills/:id', demoAuth, (req, res) => billController.updateBill(req, res));

// ============================================================================
// CLINIC SETTINGS ROUTES
// ============================================================================
router.get('/clinics/:id/settings', demoAuth, (req, res) =>
  clinicSettingsController.getSettings(req, res)
);
router.put('/clinics/:id/settings', demoAuth, tenantGuard('params.id'), (req, res) =>
  clinicSettingsController.updateSettings(req, res)
);

// ============================================================================
// CLINIC PET PARENTS ROUTES
// ============================================================================
router.get('/clinics/:id/pet-parents', demoAuth, (req, res) =>
  clinicPetParentsController.list(req, res)
);
router.post('/clinics/:id/pet-parents', demoAuth, tenantGuard('params.id'), (req, res) =>
  clinicPetParentsController.link(req, res)
);

// ============================================================================
// CLINIC-SCOPED APPOINTMENT & MEDICAL RECORD ROUTES
// ============================================================================
router.get('/clinics/:id/appointments', demoAuth, (req, res) =>
  clinicScopedController.getAppointments(req, res)
);
router.get('/clinics/:id/dashboard-stats', demoAuth, (req, res) =>
  clinicScopedController.getDashboardStats(req, res)
);
router.get('/clinics/:id/medical-records', demoAuth, (req, res) =>
  clinicScopedController.getMedicalRecords(req, res)
);

// ============================================================================
// PAWTECTORS ADMIN — PLATFORM STATS & CLINIC MANAGEMENT
// ============================================================================
router.get('/admin/platform-stats', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.getPlatformStats(req, res)
);
router.get('/admin/all-clinics', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.getAllClinics(req, res)
);
router.put('/admin/clinics/:id/activate', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.activateClinic(req, res)
);
router.put('/admin/clinics/:id/deactivate', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.deactivateClinic(req, res)
);
router.put('/admin/clinics/:id/approve', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.approveClinic(req, res)
);
router.put('/admin/clinics/:id/reject', demoAuth, demoRole(['admin']), (req, res) =>
  adminStatsController.rejectClinic(req, res)
);

export default router;
