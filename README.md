# Wilfer Solutions

Sitio bilingüe de servicios y soluciones tecnológicas de Wilfer Florentin. Está construido con Astro y TypeScript, con páginas estáticas y un endpoint de contacto ejecutado del lado del servidor.

## Requisitos

- Node.js 22.23.4 o posterior (Node.js 24 recomendado).
- npm.

## Ejecutar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Abrí la URL que muestra Astro (normalmente `http://localhost:4321`). Sin las variables de Resend, el formulario devuelve un mensaje de configuración y no simula el envío.

Comandos disponibles:

- `npm run dev`: servidor local.
- `npm run check`: validación de tipos y componentes Astro.
- `npm run build`: compilación de producción.
- `npm run preview`: vista previa local del build.

## Estructura

- `src/pages/[lang]/`: páginas en `/es/` y `/en/`.
- `src/pages/[lang]/blog/`: páginas de artículos bilingües.
- `src/content/blog/`: artículos Markdown y metadatos.
- `src/components/`: marca, navegación y pie.
- `src/layouts/`: metadatos y estructura compartidos.
- `src/lib/content.ts`: textos, navegación y rutas por idioma.
- `src/pages/api/contact.ts`: endpoint de contacto y envío de correo.
- `src/styles/global.css`: sistema visual responsive y temas.
- `public/logo-light.png` y `public/logo-dark.png`: variantes transparentes del logotipo adjunto, optimizadas para fondos claros y oscuros.
- `public/favicon.png`: recorte del símbolo del logo para pestañas del navegador.

Para agregar un artículo, creá Markdown en `src/content/blog/` con `title`, `category` y `readingTime` en el frontmatter. Incluí el idioma y el slug en `getStaticPaths()` de `src/pages/[lang]/blog/[slug].astro`, con su traducción. La lista del índice de blog y la vista previa del inicio también deben actualizarse si corresponde.

## Formulario con Resend

El correo real requiere una cuenta de Resend y un dominio desde el cual tengas permiso para enviar. El plan gratuito publicado actualmente indica 3.000 correos mensuales, un límite diario de 100 y hasta tres dominios verificados; revisá [precios y límites actuales de Resend](https://resend.com/pricing), porque pueden cambiar. Resend requiere verificar el dominio remitente antes de enviar a destinatarios arbitrarios. Seguí la [guía de verificación de dominios](https://resend.com/changelog/domain-verification-events) y agregá los registros DNS que indique el panel.

Configurá en `.env` para desarrollo y en **Vercel → Project → Settings → Environment Variables** para producción:

- `RESEND_API_KEY`: clave secreta de Resend. Solo la lee el endpoint del servidor.
- `CONTACT_FROM`: remitente en un dominio verificado, por ejemplo `Wilfer Solutions <contacto@correo.tu-dominio.com>`.
- `CONTACT_TO`: opcional; por defecto `wilfercabrera15@gmail.com`.
- `SITE_URL`: dominio público canónico con `https://` y sin barra final. Es necesario para generar sitemap, canonical y hreflang correctos.

Como confirmaste que el WhatsApp es personal, el enlace agrega el `9` requerido para móviles argentinos: `5493464515178`. WhatsApp usa números en formato internacional ([guía oficial](https://faq.whatsapp.com/5913398998672934/?locale=es_LA)); la regla argentina de móviles se detalla en la [referencia de Twilio](https://www.twilio.com/docs/whatsapp/isv/register-senders). Si el número cambia, actualizá `whatsappNumber` y `whatsappUrl` en `src/lib/content.ts`.

No uses una dirección de Gmail como `CONTACT_FROM` salvo que esté verificada en Resend. Durante el desarrollo, usá un dominio propio verificado y enviá solo a destinatarios autorizados por tu cuenta. El sitio no incluye una clave de prueba compartida.

El endpoint valida campos y origen, limita el cuerpo, incorpora honeypot y aplica cinco solicitudes por diez minutos por instancia/IP. El límite se guarda en memoria: en serverless es una defensa básica, no un límite global persistente. Si aparece abuso, agregá rate limiting persistente o CAPTCHA. Los mensajes no se guardan en la base de datos del sitio; el correo y su proveedor pueden conservarlos según sus políticas.

## Publicar en GitHub

1. Creá un repositorio público vacío llamado `wilfer-solutions`.
2. Desde esta carpeta ejecutá:

```bash
git init
git add .
git commit -m "Create Wilfer Solutions website"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/wilfer-solutions.git
git push -u origin main
```

3. No agregues `.env`, claves ni credenciales al repositorio. `.gitignore` excluye esos archivos.

## Desplegar en Vercel

1. Importá el repositorio desde Vercel.
2. Vercel detecta Astro. Instalación: `npm install`; build: `npm run build`; salida: `dist`.
3. Configurá `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` (opcional) y `SITE_URL` en el entorno de producción (y preview si corresponde).
4. Configurá y verificá el dominio remitente en Resend y el dominio público del sitio en Vercel.
5. Volvé a desplegar después de guardar variables y comprobá el envío desde el sitio publicado.

El adaptador oficial `@astrojs/vercel` habilita el endpoint servidor. El sitemap se genera cuando `SITE_URL` está configurada. Establecé el dominio real antes de publicar para que canonical y hreflang no apunten a una dirección inventada.

## Seguridad y privacidad

El sitio no almacena consultas en una base de datos ni registra su contenido en logs. El formulario envía el mensaje a la dirección configurada. Honeypot y rate limit son defensas básicas, no un servicio distribuido. La política de privacidad explica el uso de los datos y cómo solicitar su eliminación. Revisá los requisitos aplicables a tu actividad y ubicación antes de operar el sitio.
