/*
 * ========================================
 * SLIDER MODULE
 * ========================================
 * Automatic image slider with manual controls
 */

let currentSlideIndex = 0;
let slideInterval;

/**
 * Show specific slide
 */
function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length || !dots.length) return;
    
    // Wrap around
    if (n >= slides.length) {
        currentSlideIndex = 0;
    }
    if (n < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

/**
 * Change slide by offset
 */
function changeSlide(n) {
    clearInterval(slideInterval);
    currentSlideIndex += n;
    showSlide(currentSlideIndex);
    startAutoSlide();
}

/**
 * Go to specific slide
 */
function currentSlide(n) {
    clearInterval(slideInterval);
    currentSlideIndex = n;
    showSlide(currentSlideIndex);
    startAutoSlide();
}

/**
 * Auto slide to next
 */
function autoSlide() {
    currentSlideIndex++;
    showSlide(currentSlideIndex);
}

/**
 * Start automatic sliding
 */
function startAutoSlide() {
    slideInterval = setInterval(autoSlide, 3000); // Change every 3 seconds
}

/**
 * Initialize slider
 */
function initSlider() {
    showSlide(currentSlideIndex);
    startAutoSlide();
    
    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initSlider);
}
