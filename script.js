// Loading screen
window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1500);
});

// Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    document.getElementById(pageId).classList.add('active');

    // Close mobile nav if open
    document.getElementById('navLinks').classList.remove('active');
}

function toggleNav() {
    document.getElementById('navLinks').classList.toggle('active');
}

// Gallery image click handler (for future lightbox functionality)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.gallery-roulette img').forEach(img => {
        img.addEventListener('click', function() {
            // Add lightbox functionality here if needed
            console.log('Image clicked:', this.src);
        });
    });

    // Smooth scroll for gallery roulettes
    document.querySelectorAll('.gallery-roulette').forEach(gallery => {
        let isDown = false;
        let startX;
        let scrollLeft;

        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
        });

        gallery.addEventListener('mouseleave', () => {
            isDown = false;
        });

        gallery.addEventListener('mouseup', () => {
            isDown = false;
        });

        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = scrollLeft - walk;
        });
    });
});

// Close mobile nav when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');

    if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
        nav.classList.remove('active');
    }
});

// Smooth page transitions
function smoothTransition(pageId) {
    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(pageId);

    if (currentPage === targetPage) return;

    // Fade out current page
    currentPage.style.opacity = '0';

    setTimeout(() => {
        currentPage.classList.remove('active');
        targetPage.classList.add('active');
        targetPage.style.opacity = '0';

        // Fade in new page
        setTimeout(() => {
            targetPage.style.opacity = '1';
        }, 50);
    }, 300);
}

// Enhanced gallery functionality with touch support
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.gallery-roulette').forEach(gallery => {
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        // Mouse events
        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.classList.add('dragging');
            startX = e.pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
        });

        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.classList.remove('dragging');
        });

        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.classList.remove('dragging');
        });

        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 2;
            gallery.scrollLeft = scrollLeft - walk;
        });

        // Touch events for mobile
        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - gallery.offsetLeft;
            scrollLeft = gallery.scrollLeft;
        });

        gallery.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - gallery.offsetLeft;
            const walk = (x - startX) * 1.5;
            gallery.scrollLeft = scrollLeft - walk;
        });
    });
});

// Form validation and enhancement (if needed for future features)
function validateContactForm(form) {
    const email = form.querySelector('input[type="email"]');
    const message = form.querySelector('textarea');

    if (email && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Please enter a valid email address');
        return false;
    }

    if (message && message.value.length < 10) {
        alert('Please enter a message with at least 10 characters');
        return false;
    }

    return true;
}

// Lazy loading for images (performance optimization)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', handleScrollAnimations);

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu if open
        document.getElementById('navLinks').classList.remove('active');
    }

    // Arrow key navigation for galleries
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeGallery = document.querySelector('.gallery-roulette:hover');
        if (activeGallery) {
            const scrollAmount = 250;
            if (e.key === 'ArrowLeft') {
                activeGallery.scrollLeft -= scrollAmount;
            } else {
                activeGallery.scrollLeft += scrollAmount;
            }
        }
    }
});

// Performance monitoring
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            }, 0);
        });
    }
}

// Initialize performance monitoring
logPerformance();
