# 🛒 SmartSales - Frontend

![license](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Material-UI](https://img.shields.io/badge/Material--UI-7.3.5-0081CB?logo=mui)
![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?logo=vite)

> Sistema de ventas inteligente con Machine Learning, notificaciones push y análisis predictivo.

## 🎯 Características Principales

### 🤖 Machine Learning
- **Predicción de Ventas**: Modelos LSTM y Prophet para forecasting
- **Segmentación de Clientes**: K-Means clustering automático
- **Recomendaciones Personalizadas**: Sistema de ofertas ML-driven
- **Detección de Anomalías**: Isolation Forest para patrones inusuales

### 📊 Dashboard Analítico
- **Métricas en Tiempo Real**: Ventas, pedidos, clientes activos
- **Visualizaciones Interactivas**: Charts.js con gráficos avanzados
- **Reportes Dinámicos**: Generación de reportes personalizados
- **Análisis Predictivo**: Proyecciones de ventas futuras

### 🔔 Sistema de Notificaciones
- **Push Notifications**: Firebase Cloud Messaging integrado
- **Notificaciones en Tiempo Real**: Alertas de ofertas y pedidos
- **Multi-dispositivo**: Web, móvil (preparado para apps nativas)
- **Personalización**: Preferencias de usuario por tipo de notificación

### 🎁 Gestión de Ofertas Inteligentes
- **CRUD Completo**: Crear, editar, eliminar ofertas
- **Tipos de Ofertas**: Porcentaje, monto fijo, 2x1, envío gratis
- **Ofertas Personalizadas**: Basadas en ML y comportamiento del usuario
- **Segmentación**: Por categoría, marca, producto

### 🛍️ E-commerce Completo
- **Catálogo de Productos**: Búsqueda, filtros, categorías
- **Carrito de Compras**: Con persistencia local
- **Gestión de Pedidos**: Tracking completo del estado
- **Integración con Stripe**: Pagos seguros

### 👥 Gestión de Usuarios
- **Autenticación JWT**: Login/registro seguro
- **Roles y Permisos**: Admin, Vendedor, Cliente
- **Perfiles de Usuario**: Información personalizada

## 📁 Estructura del Proyecto

```
smartsales-frontend/
├── docs/                                    # 📚 Documentación
│   ├── IMPLEMENTACION_COMPLETA.md          # Guía de implementación
│   ├── FIREBASE_CONFIGURADO.md             # Setup Firebase
│   ├── PUSH_NOTIFICATIONS_IMPLEMENTADO.md  # Sistema de notificaciones
│   ├── SISTEMA_CRUD_OFERTAS.md             # CRUD de ofertas
│   ├── CORRECCION_ENDPOINTS.md             # Correcciones de API
│   ├── CORRECCION_OFFER_FORM_MODAL.md      # Fix formulario ofertas
│   └── ESTADO_ACTUAL.md                    # Estado del proyecto
│
├── public/                                  # Archivos estáticos
│   ├── firebase-messaging-sw.js            # Service Worker para push
│   └── assets/                             # Imágenes, íconos
│
├── src/
│   ├── auth/                               # 🔐 Autenticación
│   │   └── AuthContext.tsx                 # Contexto de autenticación
│   │
│   ├── components/                         # 🧩 Componentes reutilizables
│   │   ├── iconify/                        # Íconos
│   │   ├── label/                          # Labels y badges
│   │   ├── chart/                          # Gráficos
│   │   └── scrollbar/                      # Scrollbars personalizados
│   │
│   ├── config/                             # ⚙️ Configuración
│   │   └── firebaseConfig.ts               # Firebase Cloud Messaging
│   │
│   ├── contexts/                           # 🗂️ Contextos globales
│   │   ├── CartContext.tsx                 # Carrito de compras
│   │   └── ProductContext.tsx              # Productos
│   │
│   ├── hooks/                              # 🪝 Custom Hooks
│   │   └── useNotifications.ts             # Hook de notificaciones
│   │
│   ├── layouts/                            # 📐 Layouts
│   │   ├── dashboard/                      # Layout del dashboard
│   │   └── components/                     # Componentes de layout
│   │       └── notifications-popover.tsx   # Popover de notificaciones
│   │
│   ├── pages/                              # 📄 Páginas
│   │   ├── dashboard.tsx                   # Dashboard principal
│   │   ├── products.tsx                    # Catálogo de productos
│   │   ├── offers.tsx                      # Ofertas públicas
│   │   ├── admin-offers.tsx                # Admin de ofertas
│   │   ├── notifications.tsx               # Centro de notificaciones
│   │   ├── ml-dashboard.tsx                # Dashboard ML
│   │   ├── sales-dashboard.tsx             # Dashboard de ventas
│   │   └── admin-reports.tsx               # Reportes dinámicos
│   │
│   ├── routes/                             # 🛣️ Rutas
│   │   ├── sections.tsx                    # Definición de rutas
│   │   └── components/                     # Componentes de rutas
│   │       ├── AdminRoute.tsx              # Ruta protegida admin
│   │       └── ProtectedRoute.tsx          # Ruta protegida general
│   │
│   ├── sections/                           # 📦 Secciones principales
│   │   ├── admin-offers/                   # Gestión de ofertas
│   │   │   ├── view/
│   │   │   │   └── admin-offers-view.tsx   # Vista principal CRUD
│   │   │   └── offer-form-modal.tsx        # Modal formulario
│   │   ├── offers/                         # Ofertas públicas
│   │   ├── notifications/                  # Notificaciones
│   │   └── notification-settings/          # Configuración notif.
│   │
│   ├── services/                           # 🔧 Servicios
│   │   ├── api.ts                          # Cliente API base
│   │   ├── notificationService.ts          # Servicio notificaciones
│   │   ├── offerService.ts                 # Servicio ofertas
│   │   └── pushNotificationService.ts      # Servicio push FCM
│   │
│   ├── types/                              # 📝 Tipos TypeScript
│   │   ├── notification.ts                 # Tipos de notificaciones
│   │   └── offer.ts                        # Tipos de ofertas
│   │
│   ├── utils/                              # 🛠️ Utilidades
│   │   └── api.ts                          # Cliente Axios
│   │
│   ├── app.tsx                             # 🎬 App principal
│   ├── main.tsx                            # 🚀 Entry point
│   └── global.css                          # 🎨 Estilos globales
│
├── .env                                     # Variables de entorno
├── package.json                            # Dependencias
├── vite.config.ts                          # Configuración Vite
└── tsconfig.json                           # Configuración TypeScript
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js**: v20.x o superior
- **pnpm**: v10.x (recomendado) o npm
- **Backend**: [SmartSales Backend](https://smartsales-backend-891739940726.us-central1.run.app/api) corriendo

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/DiegoxdGarcia2/SmartSales-frontend.git
cd smartsales-frontend

# Instalar dependencias (recomendado: pnpm)
pnpm install
# o
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Variables de Entorno (.env)

```env
# Backend API
VITE_API_URL=https://smartsales-backend-891739940726.us-central1.run.app/api

# Firebase (Push Notifications)
VITE_FIREBASE_API_KEY=AIzaSyDhU6mgIq83K2wpKt5kFcMpg7vnmKkegts
VITE_FIREBASE_PROJECT_ID=smartsales-notifications
VITE_FIREBASE_SENDER_ID=831944193823
VITE_FIREBASE_APP_ID=1:831944193823:web:f389e61bbc052d7e6aa22a
```

### Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
# o
npm run dev

# Abrir en navegador
http://localhost:3039
```

### Build para Producción

```bash
# Generar build optimizado
pnpm build
# o
npm run build

# Preview del build
pnpm preview
# o
npm run preview
```

## 📚 Documentación

Toda la documentación técnica está en la carpeta [`docs/`](./docs/):

| Documento | Descripción |
|-----------|-------------|
| [**IMPLEMENTACION_COMPLETA.md**](./docs/IMPLEMENTACION_COMPLETA.md) | Guía completa del sistema de notificaciones y ofertas |
| [**FIREBASE_CONFIGURADO.md**](./docs/FIREBASE_CONFIGURADO.md) | Setup de Firebase Cloud Messaging |
| [**PUSH_NOTIFICATIONS_IMPLEMENTADO.md**](./docs/PUSH_NOTIFICATIONS_IMPLEMENTADO.md) | Sistema de push notifications |
| [**SISTEMA_CRUD_OFERTAS.md**](./docs/SISTEMA_CRUD_OFERTAS.md) | CRUD de ofertas inteligentes |
| [**CORRECCION_ENDPOINTS.md**](./docs/CORRECCION_ENDPOINTS.md) | Correcciones de endpoints del backend |
| [**ESTADO_ACTUAL.md**](./docs/ESTADO_ACTUAL.md) | Estado actual del proyecto |

## 🛠️ Stack Tecnológico

### Core
- **React 19.1.0**: Biblioteca UI con React Compiler
- **TypeScript 5.8.2**: Tipado estático
- **Vite 6.4.1**: Build tool ultrarrápido

### UI Framework
- **Material-UI 7.3.5**: Componentes React
- **Emotion**: CSS-in-JS
- **Iconify**: Sistema de íconos

### State Management
- **React Context API**: Estado global
- **React Router 7**: Navegación

### Data Fetching
- **Axios 1.13.2**: Cliente HTTP
- **SWR** (opcional): Data fetching con cache

### Notificaciones
- **Firebase 10.14.1**: Cloud Messaging (FCM)
- **Service Worker**: Notificaciones en background

### Charts & Visualization
- **Chart.js 4.4.8**: Gráficos interactivos
- **react-chartjs-2**: Wrapper React
- **ApexCharts**: Gráficos avanzados

### Utilities
- **date-fns 4.1.0**: Manejo de fechas
- **numeral**: Formateo de números
- **simplebar-react**: Scrollbars personalizados

### Development
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **TypeScript Compiler**: Type checking

## 🧪 Testing

```bash
# Ejecutar tests (si están configurados)
pnpm test

# Linting
pnpm lint

# Formateo
pnpm format
```

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación:

1. **Login**: `POST /api/auth/login/`
   ```json
   {
     "email": "admin@smartsales.com",
     "password": "password"
   }
   ```

2. **Registro**: `POST /api/auth/register/`
   ```json
   {
     "email": "nuevo@usuario.com",
     "password": "password",
     "first_name": "Nombre",
     "last_name": "Apellido"
   }
   ```

3. **Tokens**: Se almacenan en `localStorage`
   - `access_token`: Token de acceso (expira en 1 hora)
   - `refresh_token`: Token de refresco (expira en 7 días)

## 🎨 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMINISTRADOR** | Acceso completo: usuarios, productos, ofertas, reportes, ML |
| **VENDEDOR** | Gestión de productos, visualización de reportes limitados |
| **CLIENTE** | Compras, ver ofertas, gestionar perfil |

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones

1. **OFERTA**: Nueva oferta disponible
2. **PEDIDO**: Cambio de estado en pedido
3. **SISTEMA**: Mensajes del sistema
4. **MARKETING**: Promociones y ofertas personalizadas

### Configuración de Permisos

Los usuarios pueden configurar qué notificaciones recibir en:  
`/settings/notifications`

### Testing de Notificaciones

```bash
# Desde el backend
cd smartsales-backend
.\docs\test_notifications_simple.ps1
```

## 🎁 Sistema de Ofertas

### Tipos de Ofertas

- **Porcentaje**: 10%, 20%, 50% OFF
- **Monto Fijo**: $10 OFF, $20 OFF
- **Compra X Lleva Y**: 2x1, 3x2
- **Envío Gratis**: Sin costo de envío

### Ofertas Personalizadas con ML

El sistema usa Machine Learning para recomendar ofertas basadas en:
- Historial de compras
- Comportamiento de navegación
- Segmento de cliente (K-Means)
- Predicciones de ventas

## 📊 Dashboard ML

Acceso: `/ml-dashboard` (Solo administradores)

**Características**:
- **Predicción de Ventas**: LSTM, Prophet, ARIMA
- **Segmentación de Clientes**: K-Means clustering
- **Detección de Anomalías**: Isolation Forest
- **Análisis de Productos**: Productos más vendidos
- **Tendencias**: Análisis de tendencias temporales

## 🐛 Troubleshooting

### Error: "Firebase not initialized"

**Solución**: Verificar credenciales en `.env` y `firebaseConfig.ts`

### Error: "401 Unauthorized"

**Solución**: Token expirado, hacer logout/login nuevamente

### Error: "Service Worker registration failed"

**Solución**: Verificar que `firebase-messaging-sw.js` esté en `public/`

### Push notifications no llegan

**Checklist**:
1. ✅ Permiso de notificaciones concedido
2. ✅ Service Worker activo (DevTools → Application)
3. ✅ Token FCM registrado en backend
4. ✅ Firebase configurado correctamente

Ver [PUSH_NOTIFICATIONS_IMPLEMENTADO.md](./docs/PUSH_NOTIFICATIONS_IMPLEMENTADO.md) para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Backend**: Sistema de ML, API REST con Django
- **Frontend**: React + TypeScript + Material-UI
- **Firebase**: Push Notifications

## 🔗 Enlaces

- **Backend API**: https://smartsales-backend-891739940726.us-central1.run.app/api
- **Documentación API**: https://smartsales-backend-891739940726.us-central1.run.app/api/docs/
- **Firebase Console**: https://console.firebase.google.com/project/smartsales-notifications

## 📞 Soporte

Para soporte técnico:
- 📧 Email: soporte@smartsales.com
- 📝 Issues: [GitHub Issues](https://github.com/DiegoxdGarcia2/SmartSales-frontend/issues)
- 📚 Documentación: Ver carpeta [`docs/`](./docs/)

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**Estado**: ✅ Producción Ready
