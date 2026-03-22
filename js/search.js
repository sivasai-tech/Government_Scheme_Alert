/*
 * ========================================
 * SEARCH MODULE
 * ========================================
 * Real-time search/filter functionality
 */

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterSchemes(searchTerm);
        });
    }
}

/**
 * Filter schemes by search term
 */
function filterSchemes(searchTerm) {
    const schemeCards = document.querySelectorAll('.scheme-card');
    let visibleCount = 0;
    
    schemeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.scheme-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show message if no results
    updateSearchResults(visibleCount);
}

/**
 * Update search results message
 */
function updateSearchResults(count) {
    let resultMsg = document.getElementById('searchResults');
    
    if (!resultMsg) {
        resultMsg = document.createElement('p');
        resultMsg.id = 'searchResults';
        resultMsg.style.textAlign = 'center';
        resultMsg.style.color = '#657786';
        resultMsg.style.marginTop = '20px';
        
        const schemesGrid = document.querySelector('.schemes-grid');
        if (schemesGrid) {
            schemesGrid.parentNode.insertBefore(resultMsg, schemesGrid.nextSibling);
        }
    }
    
    if (count === 0) {
        resultMsg.textContent = 'No schemes found matching your search.';
        resultMsg.style.display = 'block';
    } else {
        resultMsg.style.display = 'none';
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initSearch);
}
