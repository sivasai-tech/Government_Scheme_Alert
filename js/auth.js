/*
 * ========================================
 * AUTHENTICATION MODULE
 * ========================================
 * Handles login state and page protection
 */

/**
 * Check if user is authenticated
 * Redirects to login if not logged in
 */
function checkAuth() {
    const isLoggedIn = localStorage.getItem('loggedIn');
    const currentPage = window.location.pathname;
    
    // Allow access to login page
    if (currentPage.includes('login.html')) {
        return;
    }
    
    // Check if logged in
    if (isLoggedIn !== 'true') {
        console.log('⚠️ User not authenticated. Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ User authenticated');
}

/**
 * Logout function
 * Clears session and redirects to login
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all login data
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        
        console.log('🚪 User logged out');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

/**
 * Get current username
 */
function getCurrentUser() {
    return localStorage.getItem('username') || 'User';
}

// Run auth check when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', checkAuth);
}
