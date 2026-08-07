/**
 * VAUGHN'S TATTOOS — pages.js
 *
 * Un módulo por página. Cada uno expone build(root) y devuelve
 * { mm, intro, enter, leave }:
 *   - mm    : instancia de gsap.matchMedia(); mm.revert() limpia TODO
 *             (tweens, ScrollTriggers y SplitText creados dentro).
 *   - intro : timeline en pausa que se dispara al terminar la transición.
 */
(function (VRL) {
    'use strict';

    var pages = {};

    /* =====================================================
       HELPERS
       ===================================================== */

    /**
     * Envuelve el patrón común: matchMedia con las condiciones del sitio,
     * salida temprana si el usuario pidió menos movimiento, y una timeline
     * de entrada en pausa.
     */
    function definePage(root, setup) {
        var state = { intro: null };

        var mm = gsap.matchMedia();

        mm.add({
            reduce: '(prefers-reduced-motion: reduce)',
            motion: '(prefers-reduced-motion: no-preference)',
            desktop: '(min-width: 769px)',
            mobile: '(max-width: 768px)'
        }, function (ctx) {
            var c = ctx.conditions;

            if (c.reduce) {
                VRL.revealAll(root);
                state.intro = gsap.timeline({ paused: true });
                return;
            }

            state.intro = setup(root, c) || gsap.timeline({ paused: true });
        }, root);

        return {
            mm: mm,
            play: function () {
                if (state.intro) state.intro.play(0);
            }
        };
    }

    /** Reveal de líneas enmascaradas ligado al scroll. */
    function revealLines(el, vars) {
        var split = VRL.splitLines(el);
        gsap.set(el, { autoAlpha: 1 });

        if (!split) return null;

        return gsap.from(split.lines, Object.assign({
            yPercent: 110,
            duration: 1,
            stagger: 0.09,
            ease: 'needle'
        }, vars || {}));
    }

    /* =====================================================
       HOME
       ===================================================== */

    pages.home = function (root) {
        return definePage(root, function (root) {
            var tl = gsap.timeline({ paused: true });

            /* --- Hero: el título se traza --- */
            var title = root.querySelector('.hero-title');
            var heroImg = root.querySelector('.hero-image-parallax img');
            var heroWrap = root.querySelector('.hero-image-parallax');

            gsap.set(title, { autoAlpha: 1 });

            var titleSplit = window.SplitText
                ? SplitText.create(title, { type: 'chars, words, lines', mask: 'lines' })
                : null;

            if (titleSplit) {
                tl.from(titleSplit.chars, {
                    yPercent: 125,
                    rotate: function () { return gsap.utils.random(-9, 9); },
                    duration: 1.2,
                    ease: 'needle',
                    stagger: { amount: 0.55, from: 'center' }
                }, 0);
            }

            tl.from(heroWrap, {
                scale: 1.14,
                autoAlpha: 0,
                duration: 1.6,
                ease: 'ink'
            }, 0);

            /* --- Parallax del hero (el paso a color lo lleva el CSS) --- */
            if (heroImg) {
                gsap.to(heroImg, {
                    yPercent: -13,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero-immersive',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

            /* --- Marquee: loop real, acelerado por el scroll --- */
            var track = root.querySelector('.marquee-track');
            if (track) {
                var loop = gsap.to(track, {
                    xPercent: -50,
                    duration: 26,
                    ease: 'none',
                    repeat: -1
                });

                var settle;
                ScrollTrigger.create({
                    trigger: '.marquee-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    onUpdate: function (self) {
                        var v = self.getVelocity();
                        var dir = v < 0 ? -1 : 1;
                        var boost = gsap.utils.clamp(1, 7, Math.abs(v) / 260);

                        gsap.to(loop, { timeScale: dir * boost, duration: 0.35, overwrite: true });

                        clearTimeout(settle);
                        settle = setTimeout(function () {
                            gsap.to(loop, { timeScale: dir, duration: 1.2, overwrite: true });
                        }, 160);
                    }
                });
            }

            /* --- Intro grid --- */
            var statement = root.querySelector('.big-statement');
            if (statement) {
                revealLines(statement, {
                    scrollTrigger: { trigger: statement, start: 'top 82%' }
                });
            }

            root.querySelectorAll('.intro-text p').forEach(function (p) {
                revealLines(p, {
                    yPercent: 100,
                    duration: 0.9,
                    stagger: 0.06,
                    scrollTrigger: { trigger: p, start: 'top 88%' }
                });
            });

            var introBtn = root.querySelector('.intro-text .btn-magnetic');
            if (introBtn) {
                gsap.from(introBtn, {
                    autoAlpha: 0,
                    y: 26,
                    duration: 0.8,
                    scrollTrigger: { trigger: introBtn, start: 'top 92%' }
                });
            }

            return tl;
        });
    };

    /* =====================================================
       ABOUT
       ===================================================== */

    pages.about = function (root) {
        var video = root.querySelector('.video-background');

        var page = definePage(root, function (root, c) {
            var tl = gsap.timeline({ paused: true });

            var heading = root.querySelector('.about-overlay h2');
            var paras = root.querySelectorAll('.about-overlay p');
            var btn = root.querySelector('.about-overlay .btn-magnetic');

            if (heading) {
                gsap.set(heading, { autoAlpha: 1 });
                var hs = window.SplitText ? SplitText.create(heading, { type: 'chars, words', mask: 'words' }) : null;
                if (hs) {
                    tl.from(hs.chars, {
                        yPercent: 120,
                        duration: 1,
                        ease: 'needle',
                        stagger: { amount: 0.4, from: 'start' }
                    }, 0.1);
                } else {
                    tl.from(heading, { autoAlpha: 0, y: 30 }, 0.1);
                }
            }

            paras.forEach(function (p, i) {
                gsap.set(p, { autoAlpha: 1 });
                var s = VRL.splitLines(p);
                if (s) {
                    tl.from(s.lines, { yPercent: 110, duration: 0.8, ease: 'needle' }, 0.35 + i * 0.12);
                } else {
                    tl.from(p, { autoAlpha: 0, y: 20 }, 0.35 + i * 0.12);
                }
            });

            if (btn) tl.from(btn, { autoAlpha: 0, y: 24, duration: 0.7 }, '-=0.3');

            // El vídeo respira: escala muy leve, ligada al scroll
            if (video && c.desktop) {
                gsap.fromTo(video,
                    { scale: 1.08 },
                    {
                        scale: 1,
                        ease: 'none',
                        scrollTrigger: { trigger: '.about-section', start: 'top top', end: 'bottom top', scrub: true }
                    });
            }

            return tl;
        });

        // El vídeo solo corre mientras la página está a la vista
        page.enter = function () {
            if (!video) return;
            video.preload = 'auto';
            var p = video.play();
            if (p && p.catch) p.catch(function () { /* autoplay bloqueado */ });
        };

        page.leave = function () {
            if (video) video.pause();
        };

        return page;
    };

    /* =====================================================
       STYLES — índice tipográfico + mosaico de detalle
       ===================================================== */

    pages.styles = function (root) {
        var stage      = root.querySelector('.styles-stage');
        var indexWrap  = root.querySelector('.style-index-wrap');
        var workWrap   = root.querySelector('.style-work');
        var workTitle  = root.querySelector('.work-title');
        var workCount  = root.querySelector('.work-count');
        var backBtn    = root.querySelector('.back-btn');
        var stripEl    = root.querySelector('.work-strip');
        var track      = root.querySelector('.strip-track');
        var grid       = track;

        var rows  = Array.prototype.slice.call(root.querySelectorAll('.style-row'));
        var items = Array.prototype.slice.call(root.querySelectorAll('.grid-item'));

        var stackEl = document.querySelector('.preview-stack');
        var layers  = stackEl ? Array.prototype.slice.call(stackEl.querySelectorAll('img')) : [];

        var teardown = [];
        var openStyle = null;

        /* -------------------------------------------------
           Entrada de la página
           ------------------------------------------------- */

        var page = definePage(root, function (root) {
            var tl = gsap.timeline({ paused: true });
            var eyebrow = root.querySelector('.eyebrow');

            if (eyebrow) {
                gsap.set(eyebrow, { autoAlpha: 1 });
                tl.from(eyebrow, { autoAlpha: 0, y: 16, duration: 0.6 }, 0.1);
            }

            tl.from(rows, {
                yPercent: 110,
                autoAlpha: 0,
                duration: 1,
                ease: 'needle',
                stagger: 0.08
            }, 0.2);

            return tl;
        });

        /* -------------------------------------------------
           Pila de piezas que sigue al cursor
           ------------------------------------------------- */

        var follow = [];
        var ROTATIONS = [-7, 5, -3, 8];
        var hovering = null;
        var cycleId = null;
        var offset = 0;

        function srcsFor(cat) {
            return items
                .filter(function (el) { return el.dataset.category === cat; })
                .map(function (el) { return el.querySelector('img').currentSrc || el.querySelector('img').src; });
        }

        if (layers.length && VRL.prefs.finePointer && !VRL.prefs.reduced) {
            layers.forEach(function (img, i) {
                gsap.set(img, { rotate: ROTATIONS[i], scale: 0.86, autoAlpha: 0 });
                follow.push({
                    x: gsap.quickTo(img, 'x', { duration: 0.3 + i * 0.12, ease: 'power3' }),
                    y: gsap.quickTo(img, 'y', { duration: 0.3 + i * 0.12, ease: 'power3' })
                });
            });

            var onStackMove = function (e) {
                if (!hovering) return;
                for (var i = 0; i < follow.length; i++) { follow[i].x(e.clientX); follow[i].y(e.clientY); }
            };
            window.addEventListener('mousemove', onStackMove, { passive: true });
            teardown.push(function () { window.removeEventListener('mousemove', onStackMove); });
        }

        function paintStack(list) {
            for (var i = 0; i < layers.length; i++) {
                layers[i].src = list[(offset + i) % list.length];
            }
        }

        function enterStack(cat) {
            if (!follow.length) return;
            var list = srcsFor(cat);
            if (!list.length) return;

            hovering = cat;
            offset = 0;
            paintStack(list);
            gsap.set(stackEl, { visibility: 'visible' });
            // 'auto' y no true: overwrite:true mataría los quickTo que mueven
            // x/y y la pila dejaría de seguir al cursor tras el primer hover.
            gsap.to(layers, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'needle', stagger: 0.04, overwrite: 'auto' });

            clearInterval(cycleId);
            cycleId = setInterval(function () {
                offset = (offset + layers.length) % list.length;
                paintStack(list);
            }, 900);
        }

        function leaveStack() {
            if (!follow.length) return;
            hovering = null;
            clearInterval(cycleId);
            gsap.to(layers, {
                autoAlpha: 0, scale: 0.86, duration: 0.3, ease: 'power2.in', overwrite: 'auto',
                onComplete: function () { gsap.set(stackEl, { visibility: 'hidden' }); }
            });
        }

        teardown.push(function () { clearInterval(cycleId); leaveStack(); });

        /* -------------------------------------------------
           Estados de fila
           ------------------------------------------------- */

        function setActive(row, on) {
            var name = row.querySelector('.row-name');
            if (VRL.prefs.reduced) {
                row.style.setProperty('--bar', on ? 1 : 0);
                return;
            }
            gsap.to(name, { x: on ? 28 : 0, duration: 0.5, ease: 'needle' });
            gsap.to(row, { '--bar': on ? 1 : 0, duration: 0.45, ease: 'needle' });
            gsap.to(row.querySelector('.row-num'), { color: on ? '#1a1a1a' : '#B9A590', duration: 0.3 });
            rows.forEach(function (other) {
                if (other !== row) gsap.to(other, { opacity: on ? 0.28 : 1, duration: 0.35 });
            });
        }

        rows.forEach(function (row) {
            var cat = row.dataset.style;

            var onEnter = function () {
                if (!VRL.prefs.finePointer) return;
                setActive(row, true);
                enterStack(cat);
            };
            var onLeave = function () {
                if (!VRL.prefs.finePointer) return;
                setActive(row, false);
                leaveStack();
            };
            var onFocus = function () { setActive(row, true); };
            var onBlur  = function () { setActive(row, false); };
            var onClick = function () { open(cat, row.querySelector('.row-name')); };

            row.addEventListener('pointerenter', onEnter);
            row.addEventListener('pointerleave', onLeave);
            row.addEventListener('focus', onFocus);
            row.addEventListener('blur', onBlur);
            row.addEventListener('click', onClick);

            teardown.push(function () {
                row.removeEventListener('pointerenter', onEnter);
                row.removeEventListener('pointerleave', onLeave);
                row.removeEventListener('focus', onFocus);
                row.removeEventListener('blur', onBlur);
                row.removeEventListener('click', onClick);
            });
        });

        /* -------------------------------------------------
           Tira infinita

           Las piezas se posicionan en absoluto y su x se envuelve con
           gsap.utils.wrap sobre el ancho total. Al tener todas el mismo
           ancho basta un paso fijo, y el bucle no tiene costura ni extremo:
           se puede recorrer sin fin en los dos sentidos.
           ------------------------------------------------- */

        function visibleItems() {
            return items.filter(function (el) { return !el.classList.contains('is-filtered-out'); });
        }

        var strip = {
            list: [],
            setters: [],
            step: 0,
            span: 0,
            offset: 0,
            velocity: 0,
            dragging: false,
            moved: false,
            lastX: 0,
            startX: 0,
            lastDragEnd: 0,
            active: false
        };

        var skewTo = null;

        function stripEnabled() {
            return !VRL.prefs.reduced;
        }

        function measure() {
            var list = visibleItems();
            strip.list = list;
            if (!list.length) return;

            var gap = parseFloat(getComputedStyle(stripEl).getPropertyValue('--strip-gap')) || 20;
            strip.step = list[0].getBoundingClientRect().width + gap;
            strip.span = strip.step * list.length;
            strip.setters = list.map(function (el) { return gsap.quickSetter(el, 'x', 'px'); });
        }

        function render() {
            if (!strip.step) return;
            var min = -strip.step;
            var max = strip.span - strip.step;
            for (var i = 0; i < strip.list.length; i++) {
                strip.setters[i](gsap.utils.wrap(min, max, i * strip.step + strip.offset));
            }
        }

        /** Centra la pieza i por el camino más corto del bucle. */
        function toIndex(i) {
            if (!strip.step || !strip.list.length) return;
            var target = (stripEl.clientWidth - strip.step) / 2 - i * strip.step;
            var delta = gsap.utils.wrap(-strip.span / 2, strip.span / 2, target - strip.offset);
            strip.velocity = 0;
            gsap.to(strip, {
                offset: strip.offset + delta,
                duration: 0.8,
                ease: 'power3.out',
                onUpdate: render,
                overwrite: true
            });
        }

        function tick() {
            if (!strip.active || strip.dragging) return;
            if (Math.abs(strip.velocity) < 0.04) {
                if (strip.velocity !== 0) { strip.velocity = 0; if (skewTo) skewTo(0); }
                return;
            }
            strip.offset += strip.velocity;
            strip.velocity *= 0.93;
            render();
            if (skewTo) skewTo(gsap.utils.clamp(-9, 9, strip.velocity * 0.16));
        }

        /* --- Entrada del usuario --- */

        function onDown(e) {
            if (!strip.active || lb.open) return;
            strip.dragging = true;
            strip.moved = false;
            strip.pointerId = e.pointerId;
            strip.lastX = strip.startX = e.clientX;
            strip.velocity = 0;
            gsap.killTweensOf(strip);
            // El puntero NO se captura aquí. Capturarlo en todo pointerdown
            // retargeta también el "click" que sigue al soltar al elemento
            // capturador en vez de al botón bajo el dedo, y un simple tap
            // sobre una pieza nunca llegaría a abrir el lightbox.
        }

        function onMove(e) {
            if (!strip.dragging) return;
            var dx = e.clientX - strip.lastX;
            strip.lastX = e.clientX;
            strip.offset += dx;
            strip.velocity = dx;
            if (!strip.moved && Math.abs(e.clientX - strip.startX) > 6) {
                strip.moved = true;
                // Solo se captura una vez confirmado el arrastre real, para
                // que el "click" de un simple tap no acabe retargetado aquí.
                try { stripEl.setPointerCapture(strip.pointerId); } catch (err) { /* sin captura */ }
            }
            render();
            if (skewTo) skewTo(gsap.utils.clamp(-9, 9, dx * 0.16));
        }

        function onUp(e) {
            if (!strip.dragging) return;
            strip.dragging = false;
            if (strip.moved) strip.lastDragEnd = performance.now();
            try { stripEl.releasePointerCapture(e.pointerId); } catch (err) { /* idem */ }
        }

        function onWheel(e) {
            if (!strip.active || lb.open) return;
            var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (!d) return;
            e.preventDefault();
            gsap.killTweensOf(strip);
            strip.velocity = gsap.utils.clamp(-70, 70, strip.velocity - d * 0.55);
        }

        /** El foco por teclado trae la pieza al centro: si no, saltaría fuera. */
        function onFocusIn(e) {
            var fig = e.target.closest ? e.target.closest('.grid-item') : null;
            if (!fig) return;
            var i = strip.list.indexOf(fig);
            if (i > -1) toIndex(i);
        }

        if (stripEnabled()) {
            skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });

            stripEl.addEventListener('pointerdown', onDown);
            stripEl.addEventListener('pointermove', onMove);
            stripEl.addEventListener('pointerup', onUp);
            stripEl.addEventListener('pointercancel', onUp);
            stripEl.addEventListener('wheel', onWheel, { passive: false });
            stripEl.addEventListener('focusin', onFocusIn);
            window.addEventListener('resize', measure);
            gsap.ticker.add(tick);

            teardown.push(function () {
                stripEl.removeEventListener('pointerdown', onDown);
                stripEl.removeEventListener('pointermove', onMove);
                stripEl.removeEventListener('pointerup', onUp);
                stripEl.removeEventListener('pointercancel', onUp);
                stripEl.removeEventListener('wheel', onWheel);
                stripEl.removeEventListener('focusin', onFocusIn);
                window.removeEventListener('resize', measure);
                gsap.ticker.remove(tick);
                gsap.killTweensOf(strip);
                strip.active = false;
            });
        } else {
            stripEl.classList.add('is-native');
        }

        /* -------------------------------------------------
           Abrir y cerrar un estilo
           ------------------------------------------------- */

        function open(cat, fromEl) {
            if (openStyle) return;
            openStyle = cat;

            leaveStack();

            var row = rows.filter(function (r) { return r.dataset.style === cat; })[0];
            var label = row.querySelector('.row-name').textContent.trim();
            var count = items.filter(function (el) { return el.dataset.category === cat; }).length;

            workTitle.textContent = label;
            workCount.textContent = count + ' pieces';

            items.forEach(function (el) {
                el.classList.toggle('is-filtered-out', el.dataset.category !== cat);
            });

            // Medir el nombre ANTES de ocultar el índice: con display:none su
            // rect es cero y el viaje del titular saldría degenerado.
            VRL.scrollToTop(true);
            var fromRect = fromEl.getBoundingClientRect();

            indexWrap.classList.add('is-hidden');
            workWrap.classList.remove('is-hidden');
            stage.classList.add('is-dark');

            if (!stripEnabled()) {
                gsap.set(visibleItems(), { clearProps: 'opacity,visibility,transform' });
                VRL.refresh();
                backBtn.focus({ preventScroll: true });
                return;
            }

            // La tira se mide con las piezas ya visibles y arranca desde cero
            strip.offset = 0;
            strip.velocity = 0;
            strip.active = true;
            measure();
            render();

            var shown = strip.list;

            // Fila y titular comparten el mismo font-size, así que no hay
            // escala que animar: solo el recorrido hasta la cabecera.
            var toRect = workTitle.getBoundingClientRect();
            gsap.set(workTitle, {
                autoAlpha: 1,          // el cierre anterior lo dejó en 0
                x: fromRect.left - toRect.left,
                y: fromRect.top - toRect.top
            });

            gsap.timeline({ onComplete: VRL.refresh })
                .to(workTitle, { x: 0, y: 0, duration: 0.85, ease: 'power3.inOut' }, 0)
                .fromTo([backBtn, workCount], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.2)
                // Solo autoAlpha: la x la lleva el bucle y un tween encima
                // pelearía con ella.
                .fromTo(shown,
                    { autoAlpha: 0 },
                    { autoAlpha: 1, duration: 0.7, ease: 'needle', stagger: 0.05 }, 0.15)
                .fromTo(root.querySelector('.strip-hint'),
                    { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.7)
                .add(function () { backBtn.focus({ preventScroll: true }); });
        }

        function close() {
            if (!openStyle) return;
            if (lb.open) closeLightbox();

            // El foco vuelve a la fila de la que se salió, no al principio
            var row = rows.filter(function (r) { return r.dataset.style === openStyle; })[0];
            openStyle = null;
            rows.forEach(function (r) { setActive(r, false); });

            strip.active = false;
            strip.velocity = 0;
            gsap.killTweensOf(strip);
            if (skewTo) skewTo(0);

            function done() {
                workWrap.classList.add('is-hidden');
                indexWrap.classList.remove('is-hidden');
                stage.classList.remove('is-dark');
                gsap.set(rows, { clearProps: 'opacity,transform,visibility' });
                VRL.scrollToTop(true);
                VRL.refresh();
                if (row) row.focus({ preventScroll: true });
            }

            if (!stripEnabled()) { done(); return; }

            gsap.timeline({ onComplete: done })
                .to(strip.list, {
                    autoAlpha: 0, duration: 0.4, ease: 'power2.in', stagger: 0.03
                }, 0)
                .to([workTitle, backBtn, workCount, root.querySelector('.strip-hint')],
                    { autoAlpha: 0, duration: 0.3 }, 0.15);
        }

        var onBack = function () { close(); };
        backBtn.addEventListener('click', onBack);
        teardown.push(function () { backBtn.removeEventListener('click', onBack); });

        /* -------------------------------------------------
           Lightbox: la pieza crece desde su sitio en la tira
           ------------------------------------------------- */

        var lightbox = document.getElementById('lightbox');
        var lbStage  = lightbox.querySelector('.lightbox-stage');
        var backdrop = lightbox.querySelector('.lightbox-backdrop');
        var ui       = lightbox.querySelector('.lightbox-ui');
        var counter  = lightbox.querySelector('.lightbox-counter');

        var lb = { open: false, list: [], index: -1, img: null, lastFocus: null };

        /** Caja final: la proporción natural de la foto dentro del escenario. */
        function fitBox(img) {
            var r = lbStage.getBoundingClientRect();
            var nw = img.naturalWidth || 800;
            var nh = img.naturalHeight || 1067;
            var scale = Math.min(r.width / nw, r.height / nh);
            return { w: Math.round(nw * scale), h: Math.round(nh * scale) };
        }

        /**
         * Sube a la variante grande. Cambiar sizes no basta: el navegador
         * puede quedarse con el candidato que ya tiene en caché, así que se
         * vacía el srcset y se fija el src a mano. Se precarga antes de
         * intercambiar para que no haya parpadeo a mitad del vuelo.
         */
        function upgradeSource(img) {
            var set = img.getAttribute('srcset') || '';
            var big = set.split(',').map(function (s) { return s.trim().split(/\s+/)[0]; }).pop();
            if (!big || img.getAttribute('src') === big) return;

            var pre = new Image();
            pre.onload = function () {
                if (lb.img !== img) return;
                img._vrlSrcset = set;
                img._vrlSrc = img.getAttribute('src');
                img.removeAttribute('srcset');
                img.src = big;
            };
            pre.src = big;
        }

        function restoreSource(img) {
            if (!img._vrlSrcset) return;
            img.setAttribute('srcset', img._vrlSrcset);
            img.setAttribute('src', img._vrlSrc);
            img._vrlSrcset = null;
            img._vrlSrc = null;
        }

        function placeInStage(img) {
            var box = fitBox(img);
            img.sizes = '90vw';
            gsap.set(img, { width: box.w, height: box.h });
            lbStage.appendChild(img);
            upgradeSource(img);
        }

        function sendHome(img) {
            var figure = img._vrlHome;
            if (!figure) return;
            restoreSource(img);
            gsap.set(img, { clearProps: 'width,height,x,y,opacity,visibility' });
            img.sizes = img._vrlSizes || '';
            figure.insertBefore(img, figure.firstChild);
        }

        function updateCounter() {
            if (counter) counter.textContent = (lb.index + 1) + ' / ' + lb.list.length;
        }

        function openAt(index) {
            lb.list = visibleItems();
            lb.index = index;

            var figure = lb.list[index];
            var img = figure && figure.querySelector('img');
            if (!img) return;

            lb.open = true;
            lb.img = img;
            lb.lastFocus = document.activeElement;
            img._vrlHome = figure;
            img._vrlSizes = img.getAttribute('sizes') || '';

            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            if (VRL.smoother) VRL.smoother.paused(true);
            updateCounter();

            if (VRL.prefs.reduced) {
                placeInStage(img);
                gsap.set([backdrop, ui], { opacity: 1 });
            } else {
                figure.classList.add('is-flipping');
                // El estado guarda también el scale del recorte, así que Flip
                // deshace el zoom mientras la pieza crece: un solo gesto.
                var state = Flip.getState(img);
                placeInStage(img);

                gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' });
                gsap.to(ui, { opacity: 1, duration: 0.3, delay: 0.25 });

                Flip.from(state, {
                    duration: 0.75,
                    ease: 'power3.inOut',
                    absolute: true,
                    scale: false,
                    onComplete: function () { figure.classList.remove('is-flipping'); }
                });
            }

            var closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus({ preventScroll: true });
        }

        function closeLightbox() {
            if (!lb.open) return;
            lb.open = false;

            var img = lb.img;
            var figure = img && img._vrlHome;

            document.body.style.overflow = '';
            if (VRL.smoother) VRL.smoother.paused(false);

            function finish() {
                lightbox.classList.remove('is-open');
                if (figure) figure.classList.remove('is-flipping');
                if (lb.lastFocus && document.contains(lb.lastFocus)) lb.lastFocus.focus({ preventScroll: true });
                lb.img = null;
            }

            if (!img || !figure || VRL.prefs.reduced) {
                if (img) sendHome(img);
                gsap.set([backdrop, ui], { opacity: 0 });
                finish();
                return;
            }

            figure.classList.add('is-flipping');
            var state = Flip.getState(img);
            sendHome(img);

            gsap.to(backdrop, { opacity: 0, duration: 0.45, ease: 'power2.in' });
            gsap.to(ui, { opacity: 0, duration: 0.2 });

            Flip.from(state, {
                duration: 0.65,
                ease: 'power3.inOut',
                absolute: true,
                scale: false,
                onComplete: finish
            });
        }

        /** Cambio de pieza sin Flip: la anterior sale, la nueva entra. */
        function step(delta) {
            if (!lb.open || lb.list.length < 2) return;

            var oldImg = lb.img;
            var nextIndex = gsap.utils.wrap(0, lb.list.length, lb.index + delta);
            var figure = lb.list[nextIndex];
            var img = figure && figure.querySelector('img');
            if (!img || img === oldImg) return;

            lb.index = nextIndex;
            lb.img = img;
            img._vrlHome = figure;
            img._vrlSizes = img.getAttribute('sizes') || '';
            updateCounter();

            var dur = VRL.prefs.reduced ? 0 : 0.4;

            gsap.to(oldImg, {
                autoAlpha: 0,
                x: -60 * delta,
                duration: dur,
                ease: 'power2.in',
                onComplete: function () { sendHome(oldImg); }
            });

            placeInStage(img);
            gsap.fromTo(img,
                { autoAlpha: 0, x: 60 * delta },
                { autoAlpha: 1, x: 0, duration: dur, ease: 'power3.out', delay: dur * 0.5 });
        }

        function onGridClick(e) {
            var trigger = e.target.closest('.grid-item-trigger');
            if (!trigger) return;
            // Arrastrar la tira no debe abrir la pieza que quedó bajo el dedo
            if (strip.moved || performance.now() - strip.lastDragEnd < 120) return;
            var figure = trigger.closest('.grid-item');
            var idx = visibleItems().indexOf(figure);
            if (idx > -1) openAt(idx);
        }

        function onKey(e) {
            if (lb.open) {
                if (e.key === 'Escape') closeLightbox();
                else if (e.key === 'ArrowRight') step(1);
                else if (e.key === 'ArrowLeft') step(-1);
                return;
            }
            if (e.key === 'Escape' && openStyle) close();
        }

        function onBackdrop(e) {
            if (e.target === backdrop || e.target === lbStage || e.target === lightbox) closeLightbox();
        }

        var closeBtn = lightbox.querySelector('.lightbox-close');
        var prevBtn  = lightbox.querySelector('.lightbox-prev');
        var nextBtn  = lightbox.querySelector('.lightbox-next');

        var onClose = function () { closeLightbox(); };
        var onPrev  = function () { step(-1); };
        var onNext  = function () { step(1); };

        grid.addEventListener('click', onGridClick);
        closeBtn.addEventListener('click', onClose);
        prevBtn.addEventListener('click', onPrev);
        nextBtn.addEventListener('click', onNext);
        lightbox.addEventListener('click', onBackdrop);
        document.addEventListener('keydown', onKey);

        teardown.push(function () {
            grid.removeEventListener('click', onGridClick);
            closeBtn.removeEventListener('click', onClose);
            prevBtn.removeEventListener('click', onPrev);
            nextBtn.removeEventListener('click', onNext);
            lightbox.removeEventListener('click', onBackdrop);
            document.removeEventListener('keydown', onKey);
            if (lb.open) closeLightbox();
        });

        /* -------------------------------------------------
           Limpieza al salir de la página
           ------------------------------------------------- */

        page.leave = function () {
            teardown.forEach(function (fn) { fn(); });
            teardown.length = 0;

            // Deja la página en el índice para la próxima visita
            openStyle = null;
            indexWrap.classList.remove('is-hidden');
            workWrap.classList.add('is-hidden');
            stage.classList.remove('is-dark');
            items.forEach(function (el) { el.classList.remove('is-filtered-out'); });
        };

        return page;
    };

    /* =====================================================
       BOOKING PROCESS
       ===================================================== */

    pages.booking = function (root) {
        return definePage(root, function (root) {
            var tl = gsap.timeline({ paused: true });

            var h2 = root.querySelector('.booking-header h2');
            var lead = root.querySelector('.booking-header p');

            if (h2) {
                gsap.set(h2, { autoAlpha: 1 });
                var s = window.SplitText ? SplitText.create(h2, { type: 'chars, words', mask: 'words' }) : null;
                if (s) tl.from(s.chars, { yPercent: 120, duration: 0.9, ease: 'needle', stagger: { amount: 0.4 } }, 0.1);
            }
            if (lead) tl.from(lead, { autoAlpha: 0, y: 18, duration: 0.6 }, 0.4);

            /* --- La línea de tinta se traza con el scroll --- */
            var line = root.querySelector('.booking-progress path');
            var steps = Array.prototype.slice.call(root.querySelectorAll('.step'));

            if (line && window.DrawSVGPlugin && steps.length) {
                gsap.fromTo(line,
                    { drawSVG: '0% 0%' },
                    {
                        drawSVG: '0% 100%',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '.booking-steps',
                            start: 'top 70%',
                            end: 'bottom 85%',
                            scrub: 0.6
                        }
                    });
            }

            /* --- Cada paso: círculo dibujado + tarjeta que sube --- */
            steps.forEach(function (step) {
                var circle = step.querySelector('.step-number circle');
                var num = step.querySelector('.step-number span');

                var stepTl = gsap.timeline({
                    scrollTrigger: { trigger: step, start: 'top 82%' }
                });

                stepTl.from(step, { autoAlpha: 0, y: 48, duration: 0.8, ease: 'needle' }, 0);

                if (circle && window.DrawSVGPlugin) {
                    stepTl.fromTo(circle,
                        { drawSVG: '0% 0%' },
                        { drawSVG: '0% 100%', duration: 0.9, ease: 'power2.inOut' }, 0.15);
                }
                if (num) {
                    stepTl.from(num, { autoAlpha: 0, scale: 0.5, duration: 0.5, ease: 'back.out(2)' }, 0.3);
                }
            });

            var btn = root.querySelector('.get-started-container .btn-magnetic');
            if (btn) {
                gsap.from(btn, {
                    autoAlpha: 0, y: 24, duration: 0.7,
                    scrollTrigger: { trigger: btn, start: 'top 92%' }
                });
            }

            return tl;
        });
    };

    /* =====================================================
       BOOK NOW — canvas de tinta sobre el ticker de GSAP
       ===================================================== */

    pages['book-now'] = function (root) {
        var canvas = root.querySelector('#ink-canvas');
        var section = root.querySelector('.book-now-section');
        var ctx2d = canvas ? canvas.getContext('2d') : null;

        var particles = [];
        var pointer = { x: -999, y: -999, active: false };
        var dpr = 1;
        var running = false;

        var page = definePage(root, function (root) {
            var tl = gsap.timeline({ paused: true });

            var h2 = root.querySelector('.book-now-section h2');
            var form = root.querySelector('.tally-embed');

            if (h2) {
                gsap.set(h2, { autoAlpha: 1 });
                var s = VRL.splitLines(h2);
                if (s) tl.from(s.lines, { yPercent: 115, duration: 0.9, stagger: 0.08, ease: 'needle' }, 0.1);
            }
            if (form) tl.from(form, { autoAlpha: 0, y: 40, duration: 0.9, ease: 'ink' }, 0.35);

            return tl;
        });

        /* --- Sistema de partículas --- */

        function resize() {
            if (!canvas || !section) return;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = section.offsetWidth;
            var h = section.offsetHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawn(x, y, count, splatter) {
            for (var i = 0; i < count; i++) {
                if (particles.length > 900) break;
                var angle = Math.random() * Math.PI * 2;
                var speed = splatter ? Math.random() * 3.4 : Math.random() * 1.2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - (splatter ? 0.4 : 0),
                    size: Math.random() * 3 + 1,
                    life: 1,
                    decay: 0.008 + Math.random() * 0.014,
                    // Tinta negra, con un 12% en el tono de acento de la paleta
                    color: Math.random() > 0.88 ? '185,165,144' : '26,26,26'
                });
            }
        }

        function tick() {
            if (!ctx2d) return;

            // Rastro: el papel reabsorbe la tinta poco a poco
            ctx2d.fillStyle = 'rgba(246, 243, 236, 0.16)';
            ctx2d.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];

                p.vy += 0.045;          // gravedad: la tinta escurre
                p.vx *= 0.975;          // rozamiento
                p.vy *= 0.985;
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx2d.fillStyle = 'rgba(' + p.color + ',' + (p.life * 0.85).toFixed(3) + ')';
                ctx2d.beginPath();
                ctx2d.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx2d.fill();
            }

            // Goteo ambiental: el lienzo no queda muerto sin ratón
            if (!pointer.active && Math.random() > 0.94 && particles.length < 260) {
                spawn(Math.random() * (canvas.width / dpr), -10, 1, false);
            }
        }

        function onMove(e) {
            var r = canvas.getBoundingClientRect();
            pointer.x = e.clientX - r.left;
            pointer.y = e.clientY - r.top;
            pointer.active = true;
            spawn(pointer.x, pointer.y, 3, true);
        }

        function onLeave() { pointer.active = false; }

        page.enter = function () {
            if (!canvas || !ctx2d || VRL.prefs.reduced) return;
            resize();
            running = true;
            gsap.ticker.add(tick);
            window.addEventListener('resize', resize);
            section.addEventListener('pointermove', onMove, { passive: true });
            section.addEventListener('pointerleave', onLeave);
        };

        page.leave = function () {
            if (!running) return;
            running = false;
            gsap.ticker.remove(tick);
            window.removeEventListener('resize', resize);
            section.removeEventListener('pointermove', onMove);
            section.removeEventListener('pointerleave', onLeave);
            particles.length = 0;
            if (ctx2d) ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        };

        return page;
    };

    VRL.pages = pages;
})(window.VRL);
