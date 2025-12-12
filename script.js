/**
 * Vaughn's Tattoos - Interactive Experience Script
 * Updated to support Magnetic Buttons, SPA transitions, and Smooth Reveals.
 */

// State Management
let scrollObserver = null;
let activePageId = 'home';

// 1. Initialization & Preloader
window.addEventListener('load', () => {
    const loader = document.querySelector('.preloader');
    const counter = document.querySelector('.counter');
    let count = 0;

    // Disable scroll during load
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 10) + 1;
        if (count > 100) count = 100;
        counter.innerText = count + '%';

        if (count === 100) {
            clearInterval(interval);
            setTimeout(() => {
                // Fade out loader
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';

                // Enable scroll
                document.body.style.overflow = '';

                // Initialize App features
                initScrollAnimations();
                initMagneticButtons();
                initParallax();
                initLightbox();

                setTimeout(() => {
                    loader.classList.add('hidden');
                }, 500);
            }, 500);
        }
    }, 30);
});

// 2. Custom Cursor Logic (Enhanced)
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    // We add translate(-50%, -50%) to maintain the center anchor
    cursorDot.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;

    // Outline follows with smooth lag
    // We also add translate(-50%, -50%) here to keep the outline centered around the dot
    cursorOutline.animate({
        transform: `translate(${posX}px, ${posY}px) translate(-50%, -50%)`
    }, { duration: 500, fill: "forwards" });
});

// Hover effects for cursor
const addHoverListeners = () => {
    // Added specific selectors like .logo and input fields if you have them
    const hoverables = document.querySelectorAll('a, button, .menu-toggle, .grid-item, .btn-magnetic, input, textarea, .logo');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
};
addHoverListeners(); // Run initially

// 3. Magnetic Buttons Logic
// Applies physics to elements with class .btn-magnetic
function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn-magnetic');
    const width = window.innerWidth;

    // Disable on mobile to prevent scroll issues
    if(width < 768) return;

    magnets.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move the button slightly towards the mouse (strength factor 0.5)
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;

            // Move the text/span inside slightly more for depth effect
            const span = btn.querySelector('span');
            if(span) {
                span.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            // Snap back to center
            btn.style.transform = 'translate(0px, 0px)';
            const span = btn.querySelector('span');
            if(span) span.style.transform = 'translate(0px, 0px)';
        });
    });
}

// 4. Navigation Toggle
function toggleNav() {
    const overlay = document.getElementById('navOverlay');
    const menuToggle = document.querySelector('.menu-toggle');

    overlay.classList.toggle('active');
    menuToggle.classList.toggle('open'); // Optional: Add CSS for hamburger animation

    // Prevent body scroll when menu is open
    if(overlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// 5. SPA Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const overlay = document.getElementById('navOverlay');

    if (overlay.classList.contains('active')) {
        toggleNav();
    }

    if (activePageId === pageId) return;

    // --- NEW: Stop animation if leaving book-now ---
    if (activePageId === 'book-now') {
        stopInkAnimation();
    }

    activePageId = pageId;
    window.scrollTo({ top: 0, behavior: 'auto' });

    pages.forEach(page => {
        if (page.id === pageId) {
            // Fade IN the new page (delayed)
            setTimeout(() => {
                page.classList.add('active');
                // --- NEW: Start animation if entering book-now ---
                if (pageId === 'book-now') {
                    // Slight delay to ensure div is visible for sizing
                    setTimeout(startInkAnimation, 100);
                }
                // Existing re-initialization...
                setTimeout(() => {
                    initScrollAnimations();
                    initMagneticButtons();
                    addHoverListeners();
                    initLightbox();
                    window.dispatchEvent(new Event('scroll'));
                }, 100);
            }, 300);
        } else {
            // OPTIONAL CHANGE: If the page is currently active, fade it out first
            if(page.classList.contains('active')){
                page.style.opacity = '0'; // Visually fade out
                setTimeout(() => {
                    page.classList.remove('active'); // Hide from DOM after fade
                    page.style.opacity = ''; // Reset opacity for next time
                }, 300); // Match this delay with the timeout above
            } else {
                page.classList.remove('active');
            }
        }
    });
}

// 6. Scroll Reveal Animation (Enhanced)
function initScrollAnimations() {
    // Disconnect previous observer if exists to avoid duplicates
    if (scrollObserver) scrollObserver.disconnect();

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% visible
    };

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // scrollObserver.unobserve(entry.target);
            }
        });
    }, options);

    const elementsToReveal = document.querySelectorAll('.reveal-text, .fade-in-up, .grid-item, .hero-title, .big-statement');
    elementsToReveal.forEach(el => {
        scrollObserver.observe(el);
    });
}

// 7. Parallax & Marquee Logic
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Hero Parallax
        const heroImg = document.querySelector('.hero-image-parallax img');
        if (heroImg && document.getElementById('home').classList.contains('active')) {
            heroImg.style.transform = `scale(1.1) translateY(${scrollY * 0.2}px)`;
        }

        // Marquee Speedup
        const marqueeContent = document.querySelector('.marquee-content');
        if (marqueeContent && document.getElementById('home').classList.contains('active')) {
            // Move marquee slightly based on scroll to create dynamic speed
            marqueeContent.style.transform = `translateX(-${scrollY * 0.5}px)`;
        }
    });
}

// 8. Gallery Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const gridItems = document.querySelectorAll('.grid-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update Active State
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;

        gridItems.forEach(item => {
            // Reset animation class to allow re-triggering
            item.classList.remove('visible');

            if (filter === 'all' || item.classList.contains(filter)) {
                item.style.display = 'block';
                // Small timeout to allow display:block to apply before adding visible class
                setTimeout(() => item.classList.add('visible'), 50);
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// 9. Lazy Load Images
document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll("img.lazy");

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;

                    img.onload = () => {
                        img.classList.remove("lazy");
                        img.classList.add("loaded"); // Add loaded class for CSS transition
                    };

                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
        });
    }
});

// 10. Lightbox Logic
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    // Seleccionamos todas las imágenes dentro de grid-items
    // Usamos delegación de eventos o re-asignamos listeners
    const images = document.querySelectorAll('.grid-item img');

    images.forEach(img => {
        // Aseguramos que el cursor muestre que es clickeable
        img.style.cursor = 'pointer';

        img.addEventListener('click', () => {
            const src = img.getAttribute('src');
            // Si la imagen no ha cargado (lazy), usamos data-src
            const finalSrc = src || img.getAttribute('data-src');

            lightboxImg.src = finalSrc;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloquear scroll
        });
    });

    // Función para cerrar
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Habilitar scroll

        // Limpiar src después de la transición para evitar parpadeos
        setTimeout(() => {
            lightboxImg.src = '';
        }, 400);
    };

    // Event Listeners para cerrar
    closeBtn.addEventListener('click', closeLightbox);

    // Cerrar al hacer clic fuera de la imagen (en el fondo oscuro)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* --- DYNAMIC INK CANVAS --- */
const canvas = document.getElementById('ink-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let canvasAnimationId; // To stop animation when leaving page

// Resize canvas to fit the section
function resizeCanvas() {
    const parent = document.querySelector('.book-now-section');
    if(parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
}

// Track mouse relative to canvas
const mouse = { x: undefined, y: undefined };
const bookSection = document.querySelector('.book-now-section');

// Event listener specifically for the section
bookSection.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Spawn particles on move
    for(let i = 0; i < 3; i++){
        particlesArray.push(new Particle());
    }
});

class Particle {
    constructor(){
        this.x = mouse.x;
        this.y = mouse.y;
        // Random size between 1 and 4
        this.size = Math.random() * 3 + 1;
        // Random speed/direction mimicking splatter
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        // Color variation: mostly black/ink, some accent gold
        this.color = Math.random() > 0.9 ? '#B9A590' : '#1a1a1a';
    }
    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        // Shrink particle to simulate fading ink
        if (this.size > 0.1) this.size -= 0.05;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles(){
    for(let i = 0; i < particlesArray.length; i++){
        particlesArray[i].update();
        particlesArray[i].draw();

        // Remove tiny particles
        if(particlesArray[i].size <= 0.3){
            particlesArray.splice(i, 1);
            i--;
        }
    }
}

function animateCanvas(){
    // Slightly clear the canvas to create a trail effect
    // changing the 0.1 opacity controls the length of the trail
    ctx.fillStyle = 'rgba(246, 243, 236, 0.2)'; // Using your var(--bg-color)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    handleParticles();
    canvasAnimationId = requestAnimationFrame(animateCanvas);
}

// --- INTEGRATION HELPERS ---

// Call this when entering the "book-now" page
function startInkAnimation() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animateCanvas();
}

// Call this when leaving the "book-now" page
function stopInkAnimation() {
    window.removeEventListener('resize', resizeCanvas);
    cancelAnimationFrame(canvasAnimationId);
    particlesArray = []; // Clean up memory
}
