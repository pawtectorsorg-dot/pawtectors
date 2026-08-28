/**
 * Authentication Utilities
 * Centralized functions for managing authentication state
 */

/**
 * Clear all authentication-related data from sessionStorage
 * This includes admin, provider, and customer auth data
 */
export const clearAllAuthData = (): void => {
  // Admin authentication
  sessionStorage.removeItem('pawtectors_admin_session');
  sessionStorage.removeItem('adminType');
  sessionStorage.removeItem('adminEmail');
  
  // Customer authentication
  sessionStorage.removeItem('pawtectors_auth');
  
  // Provider authentication
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
  sessionStorage.removeItem('auth_provider');
  
  // Generic auth data
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('profile');
  sessionStorage.removeItem('role');
};

/**
 * Complete logout: clear all auth data and redirect to specified page
 * @param redirectTo - URL to redirect to after logout (default: '/')
 */
export const performLogout = (redirectTo: string = '/'): void => {
  clearAllAuthData();
  window.location.href = redirectTo;
};

/**
 * Admin logout: clear all auth data and redirect to admin login
 */
export const performAdminLogout = (): void => {
  performLogout('/admin');
};

/**
 * Provider logout: clear all auth data and redirect to homepage
 */
export const performProviderLogout = (): void => {
  performLogout('/');
};

/**
 * Customer logout: clear all auth data and redirect to homepage
 */
export const performCustomerLogout = (): void => {
  performLogout('/');
};
