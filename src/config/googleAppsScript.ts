// Google Apps Script Configuration
// Update this file with your actual Google Apps Script deployment URL

export const GOOGLE_APPS_SCRIPT_CONFIG = {
  // Replace with your actual Google Apps Script deployment URL
  // Format: https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/userweb
  deploymentUrl: import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/userweb',
  
  // POST endpoint for saving bookings
  saveBookingEndpoint: 'userweb',
  
  // GET endpoint for fetching bookings
  getBookingsEndpoint: '?action=getBookings',
};

/**
 * To get your deployment URL:
 * 1. Go to script.google.com
 * 2. Open your "Pawtectors Bookings" project
 * 3. Click "Deploy" > "New deployment"
 * 4. Select type: "Web app"
 * 5. Execute as: Your Google Account
 * 6. Who has access: "Anyone"
 * 7. Click Deploy and copy the URL
 * 8. Replace YOUR_DEPLOYMENT_ID with the ID from the URL
 * 
 * Or set environment variable: VITE_GOOGLE_APPS_SCRIPT_URL
 */
