/**
 * VAUGHN'S TATTOOS — app.js
 * Router con History API, transición de cortina de tinta y arranque.
 */
(function (VRL) {
    'use strict';

    /* =====================================================
       1. RUTAS
       ===================================================== */

    var ROUTES = [
        { id: 'home',     path: '',        label: 'Home',            title: "Vaughn's Tattoos — Custom tattoo artist in Peoria, Illinois" },
        { id: 'about',    path: 'about',   label: 'About Me',        title: "About Vaughn Raffty L. — Vaughn's Tattoos" },
        { id: 'styles',   path: 'styles',  label: 'Styles',          title: "Styles & Gallery — Vaughn's Tattoos" },
        { id: 'booking',  path: 'booking', label: 'Booking Process', title: "Booking Process — Vaughn's Tattoos" },
        { id: 'book-now', path: 'book',    label: 'Book Now',        title: "Book a Session — Vaughn's Tattoos" }
    ];

    var byId = {};
    var byPath = {};
    ROUTES.forEach(function (r) { byId[r.id] = r; byPath[r.path] = r; });

    // Sobre file:// no hay servidor que resuelva rutas: se cae a hash.
    var useHash = window.location.protocol === 'file:';

    /** Directorio desde el que se sirve el sitio, sea la raíz o un subdirectorio. */
    var base = (function () {
        var p = window.location.pathname;
        if (/\.html?$/i.test(p)) p = p.replace(/[^/]+$/, '');
        var segs = p.split('/').filter(Boolean);
        var last = segs[segs.length - 1];
        if (last && Object.prototype.hasOwnProperty.call(byPath, last)) segs.pop();
        return '/' + (segs.length ? segs.join('/') + '/' : '');
    })();

    function routeFromLocation() {
        var raw;
        if (useHash) {
            raw = (window.location.hash || '').replace(/^#\/?/, '');
        } else {
            raw = window.location.pathname.slice(base.length).replace(/\/$/, '');
            if (/\.html?$/i.test(raw)) raw = '';
        }
        return byPath[raw] || byId.home;
    }

    function urlFor(route) {
        return useHash ? '#/' + route.path : base + route.path;
    }

    /* =====================================================
       2. ESTADO
       ===================================================== */

    var current = null;        // { route, el, module }
    var isNavigating = false;

    var curtain = document.querySelector('.ink-curtain');
    var layers = curtain ? curtain.querySelectorAll('.ink-layer') : [];
    var curtainLabel = curtain ? curtain.querySelector('.ink-curtain-label') : null;
    var announcer = document.querySelector('[data-route-announcer]');

    /* =====================================================
       3. MONTAJE Y DESMONTAJE DE PÁGINA
       ===================================================== */

    function mount(route) {
        var el = document.getElementById(route.id);
        if (!el) return null;

        el.classList.add('is-active');

        var factory = VRL.pages && VRL.pages[route.id];
        var module = factory && VRL.hasGSAP ? factory(el) : null;

        if (!module) VRL.revealAll(el);
        if (module && module.enter) module.enter();

        return { route: route, el: el, module: module };
    }

    function unmount(entry) {
        if (!entry) return;
        if (entry.module) {
            if (entry.module.leave) entry.module.leave();
            // mm.revert() deshace tweens, ScrollTriggers y SplitText de la página
            if (entry.module.mm) entry.module.mm.revert();
        }
        entry.el.classList.remove('is-active');
    }

    function syncChrome(route) {
        document.title = route.title;

        document.querySelectorAll('a[data-route]').forEach(function (a) {
            if (a.dataset.route === route.id) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });

        if (announcer) announcer.textContent = route.label;
    }

    /* =====================================================
       4. TRANSICIÓN: CORTINA DE TINTA
       ===================================================== */

    function transition(route, onSwap) {
        // Sin GSAP o con menos movimiento: cambio directo
        if (!VRL.hasGSAP || VRL.prefs.reduced || !curtain) {
            onSwap();
            if (current && current.module && current.module.play) current.module.play();
            isNavigating = false;
            return;
        }

        curtain.classList.add('is-active');
        if (curtainLabel) curtainLabel.textContent = route.label;

        var tl = gsap.timeline({
            onComplete: function () {
                curtain.classList.remove('is-active');
                isNavigating = false;
                if (current && current.module && current.module.play) current.module.play();
            }
        });

        // Entra: la tinta inunda desde abajo
        tl.set(layers, { transformOrigin: 'bottom center', scaleY: 0 })
          .set(curtainLabel, { autoAlpha: 0, y: 30 })
          .to(layers[0], { scaleY: 1, duration: 0.5, ease: 'ink' }, 0)
          .to(layers[1], { scaleY: 1, duration: 0.55, ease: 'ink' }, 0.08)
          .to(curtainLabel, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.35)

          // Con la pantalla cubierta se cambia el contenido
          .add(onSwap, 0.62)
          .add(function () { VRL.refresh(); }, 0.68)

          // Sale: la tinta se retira hacia arriba
          .to(curtainLabel, { autoAlpha: 0, y: -24, duration: 0.28, ease: 'power2.in' }, 0.85)
          .set(layers, { transformOrigin: 'top center' }, 0.95)
          .to(layers[1], { scaleY: 0, duration: 0.6, ease: 'ink' }, 1.0)
          .to(layers[0], { scaleY: 0, duration: 0.55, ease: 'ink' }, 1.12)
          .set(layers, { transformOrigin: 'bottom center' });

        return tl;
    }

    /* =====================================================
       5. NAVEGACIÓN
       ===================================================== */

    function go(id, opts) {
        opts = opts || {};
        var route = byId[id];
        if (!route || isNavigating) return;
        if (current && current.route.id === route.id) {
            VRL.toggleNav(false);
            VRL.scrollToTop();
            return;
        }

        isNavigating = true;
        VRL.toggleNav(false);

        if (opts.push !== false) {
            window.history.pushState({ route: route.id }, '', urlFor(route));
        }

        syncChrome(route);

        transition(route, function () {
            unmount(current);
            VRL.scrollToTop(true);
            current = mount(route);
        });
    }

    function initRouter() {
        document.addEventListener('click', function (e) {
            var a = e.target.closest ? e.target.closest('a[data-route]') : null;
            if (!a) return;
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (a.target === '_blank') return;

            e.preventDefault();
            go(a.dataset.route);
        });

        window.addEventListener('popstate', function () {
            go(routeFromLocation().id, { push: false });
        });
    }

    /* =====================================================
       6. PRELOADER — la aguja se calibra
       ===================================================== */

    function runPreloader() {
        var el = document.querySelector('.preloader');
        var counter = el ? el.querySelector('.counter') : null;

        return new Promise(function (resolve) {
            if (!el) { resolve(); return; }

            function finish() {
                el.classList.add('is-done');
                resolve();
            }

            if (!VRL.hasGSAP || VRL.prefs.reduced) {
                gsap && gsap.set ? gsap.set(el, { autoAlpha: 0 }) : (el.style.opacity = 0);
                finish();
                return;
            }

            var progress = { value: 0 };

            // La marca se traza al ritmo de la carga real, no en su propio
            // tiempo: la aguja termina justo cuando el contador llega a 100.
            var draw = gsap.timeline({ paused: true });
            if (window.DrawSVGPlugin) {
                draw.fromTo('.mark-ring', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.4, ease: 'none' }, 0)
                    .fromTo('.mark-v', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.55, ease: 'none' }, 1.25)
                    .fromTo('.mark-needle', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.3, ease: 'none' }, 1.7);
            }

            function paint() {
                if (counter) counter.textContent = Math.round(progress.value) + '%';
                draw.progress(progress.value / 100);
            }

            // Avance "honesto": sube lento hasta que la carga real termina
            gsap.to(progress, { value: 92, duration: 5, ease: 'power2.out', onUpdate: paint });

            var ready = Promise.all([
                new Promise(function (r) {
                    if (document.readyState === 'complete') r();
                    else window.addEventListener('load', r, { once: true });
                }),
                document.fonts ? document.fonts.ready : Promise.resolve()
            ]);

            ready.then(function () {
                gsap.to(progress, {
                    value: 100,
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: true,
                    onUpdate: paint,
                    onComplete: function () {
                        gsap.timeline({ onComplete: finish })
                            .to('.preloader-inner', { autoAlpha: 0, y: -30, duration: 0.45, ease: 'ink' })
                            .to(el, { yPercent: -100, duration: 0.9, ease: 'ink' }, '-=0.1');
                    }
                });
            });
        });
    }

    /* =====================================================
       7. ARRANQUE
       ===================================================== */

    function boot() {
        // El smoother debe existir antes de crear cualquier ScrollTrigger
        VRL.initSmoother();
        VRL.initCursor();
        VRL.initMagnetic();
        VRL.initNav();
        initRouter();

        var route = routeFromLocation();

        // Deja el DOM en la página correcta antes del primer paint útil
        document.querySelectorAll('.page').forEach(function (p) {
            p.classList.toggle('is-active', p.id === route.id);
        });

        syncChrome(route);
        window.history.replaceState({ route: route.id }, '', urlFor(route));

        current = mount(route);

        // Las imágenes diferidas cambian la altura: hay que recalcular triggers.
        // 'load' no burbujea, por eso se escucha en fase de captura.
        var t;
        document.addEventListener('load', function () {
            clearTimeout(t);
            t = setTimeout(VRL.refresh, 220);
        }, true);

        runPreloader().then(function () {
            VRL.refresh();
            if (current && current.module && current.module.play) current.module.play();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    VRL.go = go;
})(window.VRL);
