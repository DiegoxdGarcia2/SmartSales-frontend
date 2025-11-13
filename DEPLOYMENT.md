# 🚀 SmartSales Frontend - Despliegue en Vercel

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub/GitLab/Bitbucket
- Variables de entorno configuradas

## 🔧 Configuración de Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y configura:

### Variables Obligatorias
```bash
VITE_API_URL=https://smartsales-backend-891739940726.us-central1.run.app/api
VITE_FIREBASE_API_KEY=AIzaSyDhU6mgIq83K2wpKt5kFcMpg7vnmKkegts
VITE_FIREBASE_AUTH_DOMAIN=smartsales-notifications.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smartsales-notifications
VITE_FIREBASE_STORAGE_BUCKET=smartsales-notifications.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=831944193823
VITE_FIREBASE_APP_ID=1:831944193823:web:f389e61bbc052d7e6aa22a
VITE_FIREBASE_VAPID_KEY=BAy2aACkD_nBjgeWUFvPXxjwBBhVPEXhUVZD7Ldsu9IwlY7sSvgVJ5DPLop82OTWAoG0Qb4Wyr6aaJ8kJiAlEJw
```

### Variables Opcionales
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_GA_TRACKING_ID=G-...
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🚀 Despliegue Automático

### Opción 1: Importar desde Git (Recomendado)
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Importa tu repositorio
4. Configura las variables de entorno
5. Click "Deploy"

### Opción 2: Despliegue Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

## ⚙️ Configuración de Build

Vercel detectará automáticamente la configuración desde `vercel.json`:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: >=20

## 🔒 Seguridad

La configuración incluye headers de seguridad automáticos:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Optimizaciones

- **Cache**: Archivos estáticos cacheados por 1 año
- **Compression**: Gzip automático
- **CDN**: Distribución global automática
- **SPA Support**: Todas las rutas redirigen a `index.html`

## 🐛 Troubleshooting

### Build falla
```bash
# Verificar build localmente
npm run build

# Verificar TypeScript
npx tsc --noEmit
```

### Variables de entorno no funcionan
- Asegúrate que empiecen con `VITE_`
- Reinicia el despliegue después de cambiarlas

### Routing no funciona
- Verifica que `vercel.json` tenga las rewrites correctas
- Todas las rutas deben redirigir a `/index.html`

## 📞 Soporte

Si tienes problemas con el despliegue, revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- [Logs de build en Vercel Dashboard](https://vercel.com/dashboard)
- [Issues del repositorio](https://github.com/DiegoxdGarcia2/SmartSales-frontend/issues)