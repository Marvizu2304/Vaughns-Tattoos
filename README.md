# Vaughn's Tattoos

Sitio portafolio de **Vaughn Raffty L.** (VLR Inks), tatuador en Peoria,
Illinois. Muestra su obra en cuatro estilos —Anime / Illustrative, Traditional,
Black & Grey y Line Work—, explica el proceso de reserva y recibe solicitudes
de cita por un formulario de Tally.

En vivo: <https://www.vaughnstattoos.com>

## Stack

HTML, CSS y JavaScript planos. **Sin build, sin dependencias que instalar.**

- **GSAP 3.13** desde CDN para toda la animación (ScrollTrigger, ScrollSmoother,
  SplitText, Flip, Observer, DrawSVG, CustomEase).
- **Tally** para el formulario de reserva (embebido como iframe).
- Fotos en WebP responsive (800w / 1600w) bajo `images/optimized/`.

## Correr en local

```bash
npx -y serve -l 4173 -s .
```

El `-s` es importante: sirve `index.html` en cualquier ruta, que es lo que
necesita el router. Sin él, solo funciona entrar por `/`.

## Estructura

```
index.html      Las 5 páginas del sitio, una detrás de otra
404.html        Copia de index.html (ver nota de abajo)
style.css       Todos los estilos
js/
  core.js       Cursor, menú, botones magnéticos, scroll suave
  pages.js      La animación de cada página
  app.js        Router, transiciones y preloader
images/
  optimized/    Lo que el sitio realmente sirve
prototypes/     Exploraciones de diseño, no forman parte del sitio
```

Es una sola página con rutas reales: `/`, `/about`, `/styles`, `/booking` y
`/book`. El router intercepta los clics y cambia de página sin recargar.

## Antes de subir cambios

Si tocaste `index.html`, hay que regenerar su copia o las rutas profundas
seguirán sirviendo la versión vieja:

```bash
cp index.html 404.html
```

Los detalles de despliegue por plataforma están en [DEPLOY.md](DEPLOY.md).

---

Diseño y desarrollo: [Maximiliano Arvizu](https://www.linkedin.com/in/maximiliano-f-arvizu-villarreal/)
