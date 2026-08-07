# Notas de despliegue

El sitio pasó de ser un SPA con `onclick` a usar rutas reales con History API.
Cada página tiene su URL propia:

| Ruta | Página |
|---|---|
| `/` | Home |
| `/about` | About Me |
| `/styles` | Styles |
| `/booking` | Booking Process |
| `/book` | Book Now |

Sigue siendo un solo `index.html`: el router intercepta los clics y cambia la
página sin recargar. Pero si alguien **entra directo** a `tusitio.com/styles` o
recarga ahí, el servidor tiene que devolver `index.html` en vez de un 404.

## Configuración por hosting

**GitHub Pages** — usa `404.html`, que es una copia de `index.html`. Ya está en
el repo. Cada vez que cambies `index.html`, regenérala:

```bash
cp index.html 404.html
```

**Netlify** — usa `_redirects`, ya incluido en el repo:

```
/*  /index.html  200
```

**Vercel** — añade un `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Apache** — un `.htaccess` con `FallbackResource /index.html`.

**Nginx** — `try_files $uri $uri/ /index.html;`

Si no configuras nada, la navegación dentro del sitio funciona igual; lo único
que falla es entrar directo a una URL interna o recargar en ella.

Abriendo `index.html` con doble clic (`file://`) el router detecta que no hay
servidor y se pasa solo a rutas con hash (`#/styles`).

## Flag del scroll suave

ScrollSmoother está activo por defecto y se puede evaluar sin tocar el código:

- `?smoother=0` — lo desactiva y recuerda la preferencia en `localStorage`
- `?smoother=1` — lo vuelve a activar

Se desactiva solo en táctil y con `prefers-reduced-motion: reduce`.
Para fijar la decisión, cambia `config.smoother` en `js/core.js:16`.

## Prototipos

`prototypes/` guarda las exploraciones de la página de Styles (índice
tipográfico, hoja de flash y el banco de cuatro tratamientos). No forman parte
del sitio; están ahí como registro de las decisiones. Se pueden borrar sin
tocar nada más.

Ojo si los abres con el fallback de SPA activo: hay que usar la URL completa
con `.html` (`/prototypes/styles-lab.html`). Sin extensión, la regla de
reescritura devuelve `index.html` y el prototipo no carga.

## Imágenes

La galería sirve WebP desde `images/optimized/`. Los JPEG originales siguen en
`images/<CATEGORÍA>/` como fuente. Para regenerar tras añadir fotos nuevas:

```bash
cwebp -q 78 -resize 800 0 -m 6 origen.jpeg -o images/optimized/<cat>/<nombre>-800.webp
```

Cada pieza necesita las dos variantes (`-800` y `-1600`) porque el `srcset` de
la galería las referencia; el lightbox pide la de 1600 al abrirse.
