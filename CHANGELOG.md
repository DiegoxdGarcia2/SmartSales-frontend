# 📝 SmartSales Frontend - Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

---

## [1.0.0] - 2025-11-11

### 🎉 Lanzamiento Inicial - SmartSales

Sistema completo de ventas inteligente con Machine Learning y notificaciones push.

### ✨ Nuevas Características

#### 🤖 Machine Learning
- **Dashboard ML**: Predicciones de ventas con LSTM, Prophet y ARIMA
- **Segmentación de Clientes**: Clustering K-Means automático
- **Detección de Anomalías**: Isolation Forest para patrones inusuales
- **Recomendaciones Personalizadas**: Sistema de ofertas basado en ML

#### 🔔 Sistema de Notificaciones
- **Firebase Cloud Messaging**: Push notifications integrado
- **Service Worker**: Notificaciones en background
- **Notificaciones en Tiempo Real**: Alertas de ofertas y pedidos
- **Centro de Notificaciones**: `/notifications` con historial completo
- **Configuración de Preferencias**: `/settings/notifications`
- **Tipos de Notificaciones**: Ofertas, Pedidos, Sistema, Marketing

#### 🎁 Gestión de Ofertas Inteligentes
- **CRUD Completo**: Interfaz admin en `/admin/offers`
- **Tipos de Ofertas**: Porcentaje, monto fijo, 2x1, envío gratis
- **Ofertas Personalizadas**: Basadas en ML y comportamiento
- **Segmentación**: Por categoría, marca, producto
- **Vista Pública**: `/offers` para clientes

#### 📊 Dashboards y Reportes
- **Dashboard Principal**: Métricas en tiempo real
- **Dashboard de Ventas**: Análisis de ventas detallado
- **Reportes Dinámicos**: Generación personalizada de reportes
- **Visualizaciones**: Charts.js y ApexCharts

#### 🛍️ E-commerce
- **Catálogo de Productos**: Búsqueda, filtros, categorías
- **Carrito de Compras**: Con persistencia local
- **Gestión de Pedidos**: Tracking completo
- **Integración con Stripe**: Pagos seguros (preparado)

#### 👥 Sistema de Usuarios
- **Autenticación JWT**: Login/registro seguro
- **Roles y Permisos**: Admin, Vendedor, Cliente
- **Rutas Protegidas**: `AdminRoute`, `ProtectedRoute`
- **Perfiles de Usuario**: Gestión completa

### 🔧 Mejoras Técnicas

#### Frontend Core
- **React 19.1.0**: Con React Compiler
- **TypeScript 5.8.2**: Tipado estático completo
- **Vite 6.4.1**: Build ultrarrápido
- **Material-UI 7.3.5**: Componentes modernos

#### Arquitectura
- **Context API**: Estado global optimizado
- **Custom Hooks**: `useNotifications`, `useAuth`, etc.
- **Service Layer**: Separación de lógica de negocio
- **Type Safety**: 100% TypeScript

#### Optimizaciones
- **Code Splitting**: Lazy loading de páginas
- **Service Worker**: Cache inteligente
- **Image Optimization**: Lazy loading de imágenes
- **Bundle Size**: Optimizado para producción

### 📚 Documentación
- **README.md**: Completo y actualizado
- **docs/**: 7 documentos técnicos detallados
- **Estructura clara**: Fácil navegación del proyecto
- **.env.example**: Plantilla de variables de entorno

### 🐛 Correcciones

#### Notificaciones
- Fix: Endpoints con guiones bajos (`unread_count`)
- Fix: Manejo silencioso de errores 401
- Fix: Reducción de warnings de Firebase
- Fix: Token FCM registrado correctamente

#### Ofertas
- Fix: Tipos de oferta alineados con backend
- Fix: Campos del formulario correctos (`title`, `discount_value`)
- Fix: Validación de `offer.description` undefined
- Fix: Validación de `offers` array undefined

#### General
- Fix: ESLint `consistent-return` en `useEffect`
- Fix: Imports absolutos con alias `src/`
- Fix: Errores de TypeScript en componentes

### 🔐 Seguridad
- **JWT Authentication**: Tokens seguros
- **Protected Routes**: Control de acceso por roles
- **HTTPS Only**: Comunicación segura con backend
- **Environment Variables**: Credenciales no expuestas

### 📦 Dependencias Principales
```json
{
  "react": "19.1.0",
  "typescript": "5.8.2",
  "vite": "6.4.1",
  "@mui/material": "7.3.5",
  "firebase": "10.14.1",
  "axios": "1.13.2",
  "chart.js": "4.4.8",
  "date-fns": "4.1.0"
}
```

### 🚀 Deploy
- **Backend**: Google Cloud Run
- **Frontend**: Preparado para Vercel/Netlify
- **CDN**: Assets optimizados

---

## [Base Version] - Minimal UI v3.0.0

### 🎨 Template Base (Minimal UI)

### v3.0.0

###### Apr 3, 2025

- Support MUI v7.
- Support React v19.
- Support Eslint v9.
- Upgrade and restructure the directory.
- Upgrade some dependencies to the latest versions.

---

### v2.0.0

###### Aug 24, 2024

- [New] Migrate to typescript.
- Upgrade and restructure the directory.
- Upgrade some dependencies to the latest versions.

---

### v1.8.0

###### Wed 11, 2023

- [New] Migrate to vite.js.
- Upgrade and restructure the directory.
- Upgrade some dependencies to the latest versions

---

### v1.7.0

###### Feb 21, 2023

- Upgrade some dependencies to the latest versions

---

### v1.6.0

###### Oct 17, 2022

- Upgrade and restructure the directory.
- Upgrade some dependencies to the latest versions

---

### v1.5.0

###### Jul 04, 2022

- Support react 18.
- Upgrade some dependencies to the latest versions

---

### v1.4.0

###### Apr 12, 2022

- Update `src/components`.
- Update `src/sections`.
- Update `src/pages`.
- Update `src/layouts`.
- Update `src/theme`.
- Upgrade some dependencies to the latest versions

---

### v1.3.0

###### Feb 21, 2022

- Support react-script v5.0.0
- Source code improvement
- Upgrade some dependencies to the latest versions

---

### v1.2.0

###### Sep 18, 2021

- Support MIU v5.0.0 official release
- Upgrade some dependencies to the latest versions
- Update `src/theme/typography.js`
- Upgrade some dependencies to the latest versions

---

### v1.1.0

###### Jul 23, 2021

- Support MUI v5.0.0-beta.1
- Upgrade some dependencies to the latest versions

---

### v1.0.0

###### Jun 28, 2021

Initial release.
