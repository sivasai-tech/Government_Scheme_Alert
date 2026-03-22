/*
 * ========================================
 * NOTIFICATION MODULE
 * ========================================
 * Handles deadline notifications and alerts
 */

/**
 * Calculate days difference between two dates
 */
function getDaysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((date2 - date1) / oneDay);
    return diffDays;
}

/**
 * Check if deadline is within 7 days
 */
function isDeadlineNear(deadlineStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    
    const daysLeft = getDaysDifference(today, deadline);
    
    return daysLeft >= 0 && daysLeft <= 7;
}

/**
 * Check all schemes for upcoming deadlines
 */
function checkUpcomingDeadlines() {
    // This function will be called from scheme pages
    // It scans all schemes and shows banner if any deadline is near
    
    const schemeCards = document.querySelectorAll('.scheme-card');
    let urgentCount = 0;
    
    schemeCards.forEach(card => {
        const deadlineElement = card.querySelector('[data-deadline]');
        if (deadlineElement) {
            const deadline = deadlineElement.getAttribute('data-deadline');
            if (isDeadlineNear(deadline)) {
                urgentCount++;
                card.classList.add('urgent');
            }
        }
    });
    
    // Show notification banner if there are urgent schemes
    if (urgentCount > 0) {
        showNotificationBanner(urgentCount);
    }
}

/**
 * Show notification banner
 */
function showNotificationBanner(count) {
    const banner = document.getElementById('notificationBanner');
    const text = document.getElementById('notificationText');
    
    if (banner && text) {
        text.textContent = `${count} scheme${count > 1 ? 's are' : ' is'} closing soon. Apply now!`;
        banner.style.display = 'block';
    }
}

/**
 * Format deadline display
 */
function formatDeadline(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Get urgency label
 */
function getUrgencyLabel(deadlineStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    
    const daysLeft = getDaysDifference(today, deadline);
    
    if (daysLeft < 0) return '⏰ Expired';
    if (daysLeft === 0) return '🔴 Today!';
    if (daysLeft === 1) return '🔴 Tomorrow';
    if (daysLeft <= 7) return `🔴 ${daysLeft} days left`;
    return '';
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.checkUpcomingDeadlines = checkUpcomingDeadlines;
    window.formatDeadline = formatDeadline;
    window.getUrgencyLabel = getUrgencyLabel;
    window.isDeadlineNear = isDeadlineNear;
}
