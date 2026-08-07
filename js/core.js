/**
 * VAUGHN'S TATTOOS — core.js
 * Registro de plugins, preferencias, cursor, botones magnéticos,
 * menú y ScrollSmoother. Todo lo transversal a las cinco páginas.
 */
window.VRL = (function () {
    'use strict';

    /* =====================================================
       1. CONFIGURACIÓN
       ===================================================== */

    var params = new URLSearchParams(window.location.search);

    var config = {
        // ScrollSmoother queda tras un flag para poder evaluarlo:
        //   ?smoother=0  lo desactiva y recuerda la preferencia
        //   ?smoother=1  lo reactiva
        smoother: true,
        smoothAmount: 1.1,
        gsapVersion: window.gsap ? gsap.version : null
    };

    if (params.has('smoother')) {
        try {
            localStorage.setItem('vrl-smoother', params.get('smoother'));
        } catch (e) { /* modo privado */ }
    }

    try {
        var stored = localStorage.getItem('vrl-smoother');
        if (stored !== null) config.smoother = stored !== '0';
    } catch (e) { /* modo privado */ }

    /* =====================================================
       2. PLUGINS
       ===================================================== */

    var hasGSAP = typeof window.gsap !== 'undefined';

    if (hasGSAP) {
        var plugins = [
            window.ScrollTrigger,
            window.ScrollSmoother,
            window.SplitText,
            window.Flip,
            window.Observer,
            window.DrawSVGPlugin,
            window.CustomEase
        ].filter(Boolean);

        gsap.registerPlugin.apply(gsap, plugins);

        gsap.defaults({ duration: 0.8, ease: 'power3.out' });

        if (window.CustomEase) {
            // Entrada rápida y salida larga: el gesto de una línea trazada de un tirón
            CustomEase.create('needle', '0.16, 1, 0.3, 1');
            CustomEase.create('ink', '0.62, 0.05, 0.16, 1');
        }
    }

    /* =====================================================
       3. PREFERENCIAS DEL USUARIO
       ===================================================== */

    var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mqFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    var prefs = {
        get reduced() { return mqReduced.matches; },
        get finePointer() { return mqFinePointer.matches; }
    };

    /* =====================================================
       4. UTILIDADES
       ===================================================== */

    /** Hace visibles los elementos que el CSS oculta a la espera de animación. */
    function revealAll(root) {
        var els = (root || document).querySelectorAll('[data-anim]');
        if (els.length && hasGSAP) gsap.set(els, { autoAlpha: 1, clearProps: 'transform' });
    }

    /**
     * Reparte un texto en líneas enmascaradas listas para el reveal.
     * Devuelve null si SplitText no está disponible (degrada sin romper).
     */
    function splitLines(el, type) {
        if (!window.SplitText || !el) return null;
        return SplitText.create(el, {
            type: type || 'lines',
            mask: 'lines',
            linesClass: 'split-line'
        });
    }

    /* =====================================================
       5. CURSOR PERSONALIZADO
       ===================================================== */

    function initCursor() {
        if (!hasGSAP || !prefs.finePointer || prefs.reduced) return;

        var dot = document.querySelector('[data-cursor-dot]');
        var outline = document.querySelector('[data-cursor-outline]');
        var label = document.querySelector('[data-cursor-label]');
        if (!dot || !outline) return;

        document.body.classList.add('has-custom-cursor');

        var dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
        var dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
        var outX = gsap.quickTo(outline, 'x', { duration: 0.5, ease: 'power3' });
        var outY = gsap.quickTo(outline, 'y', { duration: 0.5, ease: 'power3' });

        window.addEventListener('mousemove', function (e) {
            dotX(e.clientX); dotY(e.clientY);
            outX(e.clientX); outY(e.clientY);
        }, { passive: true });

        // Un solo listener delegado: el código anterior acumulaba uno por
        // elemento en cada cambio de página.
        var HOVERABLE = 'a, button, .grid-item, input, textarea, [data-cursor]';

        function setState(el) {
            var mode = el ? (el.dataset.cursor || (el.matches('.grid-item, .grid-item-trigger') ? 'view' : 'hover')) : 'idle';

            if (mode === 'idle') {
                gsap.to(outline, { scale: 1, backgroundColor: 'rgba(255,255,255,0)', borderColor: '#ffffff', duration: 0.3 });
                gsap.to(label, { autoAlpha: 0, duration: 0.15 });
                gsap.to(dot, { scale: 1, duration: 0.3 });
                return;
            }

            if (mode === 'view') {
                if (label) label.textContent = 'View';
                gsap.to(outline, { scale: 1.7, backgroundColor: 'rgba(255,255,255,0.28)', borderColor: 'rgba(255,255,255,0)', duration: 0.35 });
                gsap.to(label, { autoAlpha: 1, duration: 0.25 });
                gsap.to(dot, { scale: 0, duration: 0.25 });
                return;
            }

            gsap.to(outline, { scale: 1.4, backgroundColor: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0)', duration: 0.3 });
            gsap.to(label, { autoAlpha: 0, duration: 0.15 });
            gsap.to(dot, { scale: 1, duration: 0.3 });
        }

        document.addEventListener('mouseover', function (e) {
            var el = e.target.closest ? e.target.closest(HOVERABLE) : null;
            if (el) setState(el);
        });

        document.addEventListener('mouseout', function (e) {
            var el = e.target.closest ? e.target.closest(HOVERABLE) : null;
            if (el && !el.contains(e.relatedTarget)) setState(null);
        });

        // Fuera de la ventana el cursor se desvanece en lugar de congelarse
        document.addEventListener('mouseleave', function () {
            gsap.to([dot, outline], { autoAlpha: 0, duration: 0.2 });
        });
        document.addEventListener('mouseenter', function () {
            gsap.to([dot, outline], { autoAlpha: 1, duration: 0.2 });
        });
    }

    /* =====================================================
       6. BOTONES MAGNÉTICOS
       ===================================================== */

    function initMagnetic() {
        if (!hasGSAP || !prefs.finePointer || prefs.reduced) return;

        var STRENGTH = 0.35;
        var current = null;
        var quick = null;

        function attach(btn) {
            if (btn._vrlQuick) return btn._vrlQuick;
            var span = btn.querySelector('span');
            btn._vrlQuick = {
                x: gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }),
                y: gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' }),
                sx: span ? gsap.quickTo(span, 'x', { duration: 0.6, ease: 'power3' }) : null,
                sy: span ? gsap.quickTo(span, 'y', { duration: 0.6, ease: 'power3' }) : null
            };
            return btn._vrlQuick;
        }

        document.addEventListener('pointerover', function (e) {
            var btn = e.target.closest ? e.target.closest('.btn-magnetic') : null;
            if (!btn || btn === current) return;
            current = btn;
            quick = attach(btn);
        });

        document.addEventListener('pointermove', function (e) {
            if (!current || !quick) return;
            var r = current.getBoundingClientRect();
            var x = e.clientX - r.left - r.width / 2;
            var y = e.clientY - r.top - r.height / 2;
            quick.x(x * STRENGTH);
            quick.y(y * STRENGTH);
            if (quick.sx) { quick.sx(x * 0.12); quick.sy(y * 0.12); }
        }, { passive: true });

        document.addEventListener('pointerout', function (e) {
            var btn = e.target.closest ? e.target.closest('.btn-magnetic') : null;
            if (!btn || btn !== current) return;
            if (btn.contains(e.relatedTarget)) return;

            var span = btn.querySelector('span');
            gsap.to(btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
            if (span) gsap.to(span, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
            current = null;
            quick = null;
        });
    }

    /* =====================================================
       7. MENÚ OVERLAY
       ===================================================== */

    var nav = {
        overlay: null,
        toggle: null,
        tl: null,
        isOpen: false,
        lastFocus: null
    };

    function initNav() {
        nav.overlay = document.getElementById('navOverlay');
        nav.toggle = document.querySelector('.menu-toggle');
        if (!nav.overlay || !nav.toggle) return;

        var links = nav.overlay.querySelectorAll('.nav-links a');

        if (hasGSAP && !prefs.reduced) {
            nav.tl = gsap.timeline({ paused: true })
                .set(nav.overlay, { visibility: 'visible' })
                .fromTo(nav.overlay,
                    { clipPath: 'inset(0 0 100% 0)' },
                    { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'ink' })
                .from(links, { yPercent: 110, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'needle' }, '-=0.35');
        }

        nav.toggle.addEventListener('click', function () {
            toggleNav();
        });

        document.addEventListener('keydown', function (e) {
            if (!nav.isOpen) return;
            if (e.key === 'Escape') { toggleNav(false); return; }
            if (e.key !== 'Tab') return;

            // Foco atrapado dentro del overlay mientras esté abierto
            var focusables = nav.overlay.querySelectorAll('a[href]');
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        });
    }

    function toggleNav(force) {
        var open = typeof force === 'boolean' ? force : !nav.isOpen;
        if (open === nav.isOpen) return;
        nav.isOpen = open;

        nav.toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
        if (smoother) smoother.paused(open);

        if (open) {
            nav.lastFocus = document.activeElement;
            nav.overlay.classList.add('is-open');
            if (nav.tl) nav.tl.play(); else nav.overlay.style.visibility = 'visible';
            var first = nav.overlay.querySelector('a[href]');
            if (first) first.focus({ preventScroll: true });
        } else {
            if (nav.tl) {
                nav.tl.reverse().eventCallback('onReverseComplete', function () {
                    nav.overlay.classList.remove('is-open');
                });
            } else {
                nav.overlay.classList.remove('is-open');
                nav.overlay.style.visibility = '';
            }
            if (nav.lastFocus) nav.lastFocus.focus({ preventScroll: true });
        }
    }

    /* =====================================================
       8. SCROLLSMOOTHER
       ===================================================== */

    var smoother = null;

    function initSmoother() {
        if (!hasGSAP || !window.ScrollSmoother) return null;
        if (!config.smoother || prefs.reduced) return null;

        // En táctil puro se deja el scroll nativo: mejor rendimiento y sin
        // conflicto con el iframe del formulario (smoothTouch: false).
        smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: config.smoothAmount,
            smoothTouch: false,
            effects: false,
            normalizeScroll: false,
            ignoreMobileResize: true
        });

        document.body.classList.add('smoother-on');
        return smoother;
    }

    /** Scroll al inicio, con o sin smoother. */
    function scrollToTop(instant) {
        if (smoother) {
            smoother.scrollTo(0, !instant);
        } else {
            window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
        }
    }

    /** Tras cambiar el DOM hay que recalcular alturas y triggers. */
    function refresh() {
        if (!hasGSAP || !window.ScrollTrigger) return;
        if (smoother) smoother.refresh();
        ScrollTrigger.refresh();
    }

    /* =====================================================
       9. API PÚBLICA
       ===================================================== */

    return {
        config: config,
        prefs: prefs,
        hasGSAP: hasGSAP,
        revealAll: revealAll,
        splitLines: splitLines,
        initCursor: initCursor,
        initMagnetic: initMagnetic,
        initNav: initNav,
        toggleNav: toggleNav,
        initSmoother: initSmoother,
        scrollToTop: scrollToTop,
        refresh: refresh,
        get smoother() { return smoother; }
    };
})();
