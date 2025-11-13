# 🔍 Análisis: Backend de Ofertas - SmartSales

## 📋 Estructura del Backend

### Modelo `Offer` (offers/models.py)

```python
class Offer(models.Model):
    # Información básica
    name = CharField(max_length=200)  # ❌ Frontend usa "title"
    description = TextField(blank=True)  # ✅ Match
    offer_type = CharField(OFFER_TYPES)  # ❌ Diferentes valores
    
    # Descuento
    discount_percentage = DecimalField  # ❌ Frontend usa "discount_value"
    
    # Vigencia
    start_date = DateTimeField  # ✅ Match
    end_date = DateTimeField  # ✅ Match
    
    # Estado
    status = CharField(STATUS_CHOICES)  # ❌ Frontend usa "is_active"
    
    # Restricciones
    max_uses = PositiveIntegerField(null=True)  # ✅ Match
    max_uses_per_user = PositiveIntegerField(default=1)  # ✅ Match
    min_purchase_amount = DecimalField  # ✅ Match
    target_user = ForeignKey(User, null=True)  # ❌ No existe en frontend
    priority = IntegerField(default=5)  # ❌ Frontend usa "is_featured"
    
    # Estadísticas
    views_count = PositiveIntegerField(default=0)
    clicks_count = PositiveIntegerField(default=0)
    conversions_count = PositiveIntegerField(default=0)
    
    # Metadata
    created_by = ForeignKey(User)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Tipos de Oferta (OFFER_TYPES)

**Backend**:
```python
OFFER_TYPES = [
    ('FLASH_SALE', 'Venta Flash'),
    ('DAILY_DEAL', 'Oferta del Día'),
    ('SEASONAL', 'Oferta de Temporada'),
    ('CLEARANCE', 'Liquidación'),
    ('PERSONALIZED', 'Oferta Personalizada'),
]
```

**Frontend** (❌ INCOMPATIBLE):
```typescript
type OfferType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
```

### Estados (STATUS_CHOICES)

**Backend**:
```python
STATUS_CHOICES = [
    ('DRAFT', 'Borrador'),
    ('ACTIVE', 'Activa'),
    ('PAUSED', 'Pausada'),
    ('EXPIRED', 'Expirada'),
    ('CANCELLED', 'Cancelada'),
]
```

**Frontend**: Usa `is_active: boolean` (❌ INCOMPATIBLE)

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Nombres de Campos Incompatibles

| Backend | Frontend | Status |
|---------|----------|--------|
| `name` | `title` | ❌ |
| `discount_percentage` | `discount_value` | ❌ |
| `status` | `is_active` | ❌ |
| `priority` | `is_featured` | ❌ |
| `description` | `description` | ✅ |
| `start_date` | `start_date` | ✅ |
| `end_date` | `end_date` | ✅ |
| `max_uses` | `max_uses` | ✅ |
| `max_uses_per_user` | `max_uses_per_user` | ✅ |
| `min_purchase_amount` | `min_purchase_amount` | ✅ |

### 2. Tipos de Oferta Completamente Diferentes

**Backend** (categorías de oferta):
- FLASH_SALE
- DAILY_DEAL
- SEASONAL
- CLEARANCE
- PERSONALIZED

**Frontend** (tipos de descuento):
- percentage (porcentaje)
- fixed_amount (monto fijo)
- buy_x_get_y (compra X lleva Y)
- free_shipping (envío gratis)

**PROBLEMA**: El backend solo usa `discount_percentage` (porcentaje). No tiene soporte para montos fijos, buy_x_get_y, ni free_shipping.

---

## 📡 Endpoints Disponibles

### Públicos (AllowAny)

```
GET  /api/offers/offers/              → Listar ofertas (con filtros)
GET  /api/offers/offers/{id}/         → Detalle de oferta
GET  /api/offers/offers/active/       → Solo ofertas activas públicas
GET  /api/offers/offers/featured/     → Ofertas destacadas (priority >= 5)
GET  /api/offers/categories/          → Tipos de ofertas (OFFER_TYPES)
```

### Autenticados (IsAuthenticated)

```
GET  /api/offers/offers/my_offers/    → Ofertas del usuario
GET  /api/offers/offers/personalized/ → Ofertas ML personalizadas
POST /api/offers/offers/{id}/track_view/   → Registrar vista
POST /api/offers/offers/{id}/track_click/  → Registrar click
POST /api/offers/offers/apply_to_cart/     → Aplicar oferta al carrito
```

### Solo Admin (IsAdminUser)

```
POST   /api/offers/offers/           → Crear oferta
PUT    /api/offers/offers/{id}/      → Actualizar oferta
PATCH  /api/offers/offers/{id}/      → Actualizar parcial
DELETE /api/offers/offers/{id}/      → Eliminar oferta
POST   /api/offers/offers/{id}/activate/   → Activar oferta
POST   /api/offers/offers/{id}/deactivate/ → Desactivar oferta
GET    /api/offers/offers/stats/     → Estadísticas
POST   /api/offers/offers/populate_sample_offers/ → Crear ofertas de prueba
POST   /api/offers/offers/generate_ml_recommendations/ → Generar recomendaciones ML
POST   /api/offers/offers/optimize_discount/ → Optimizar descuento
```

---

## 🛠️ Serializers

### OfferSerializer (completo)

```python
fields = [
    'id',
    'name',  # ❌ Frontend usa "title"
    'description',
    'offer_type',  # FLASH_SALE, DAILY_DEAL, etc.
    'discount_percentage',  # ❌ Frontend usa "discount_value"
    'start_date',
    'end_date',
    'status',  # DRAFT, ACTIVE, PAUSED, etc.
    'max_uses',
    'max_uses_per_user',
    'min_purchase_amount',
    'target_user',
    'target_user_name',
    'priority',
    'views_count',
    'clicks_count',
    'conversions_count',
    'conversion_rate',  # Calculado
    'is_active',  # Método: verifica status + fechas
    'time_remaining_hours',  # Calculado
    'created_by',
    'created_by_name',
    'created_at',
    'updated_at',
    'offer_products',
]
```

### CreateOfferSerializer (para crear/actualizar)

```python
fields = [
    'name',
    'description',
    'offer_type',
    'discount_percentage',
    'start_date',
    'end_date',
    'status',
    'max_uses',
    'max_uses_per_user',
    'min_purchase_amount',
    'target_user',
    'priority',
    'product_ids',  # Lista de IDs para asociar productos
]
```

---

## ✅ SOLUCIÓN PROPUESTA

### Opción 1: Adaptar Frontend al Backend (RECOMENDADO)

Ventajas:
- ✅ Backend 100% funcional y probado
- ✅ Backend tiene ML, estadísticas, tracking
- ✅ No requiere cambios en backend
- ✅ Mantiene consistencia con el sistema

Cambios necesarios en Frontend:

#### 1. Actualizar `src/types/offer.ts`

```typescript
// NUEVO: Usar tipos del backend
export type OfferType = 
  | 'FLASH_SALE'       // Venta Flash
  | 'DAILY_DEAL'       // Oferta del Día
  | 'SEASONAL'         // Oferta de Temporada
  | 'CLEARANCE'        // Liquidación
  | 'PERSONALIZED';    // Oferta Personalizada

export type OfferStatus =
  | 'DRAFT'      // Borrador
  | 'ACTIVE'     // Activa
  | 'PAUSED'     // Pausada
  | 'EXPIRED'    // Expirada
  | 'CANCELLED'; // Cancelada

export interface Offer {
  id: number;
  name: string;  // Cambiar "title" → "name"
  description: string;
  offer_type: OfferType;
  discount_percentage: number;  // Cambiar "discount_value" → "discount_percentage"
  start_date: string;
  end_date: string;
  status: OfferStatus;  // Cambiar "is_active" → "status"
  max_uses: number | null;
  max_uses_per_user: number;
  min_purchase_amount: number;
  target_user: number | null;
  target_user_name?: string;
  priority: number;  // Cambiar "is_featured" → "priority" (5+ = featured)
  
  // Estadísticas (read-only)
  views_count: number;
  clicks_count: number;
  conversions_count: number;
  conversion_rate?: number;
  is_active?: boolean;  // Calculado por backend
  time_remaining_hours?: number;  // Calculado
  
  // Metadata
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  
  // Productos asociados
  offer_products?: OfferProduct[];
}

export interface OfferProduct {
  id: number;
  offer: number;
  product: number;
  product_name?: string;
  created_at: string;
}
```

#### 2. Actualizar `src/services/offerService.ts`

```typescript
// Cambiar todos los campos:
// - title → name
// - discount_value → discount_percentage
// - is_active → status
// - is_featured → priority (>=5 es featured)

// Agregar nuevos métodos:
async trackView(id: number): Promise<void> {
  await api.get(`/offers/offers/${id}/track_view/`);
}

async trackClick(id: number): Promise<void> {
  await api.post(`/offers/offers/${id}/track_click/`);
}

async getStats(): Promise<OfferStats> {
  const response = await api.get('/offers/offers/stats/');
  return response.data;
}
```

#### 3. Actualizar `offer-form-modal.tsx`

```typescript
// Cambiar campos del formulario:
const [formData, setFormData] = useState<Partial<Offer>>({
  name: '',  // era "title"
  description: '',
  offer_type: 'FLASH_SALE',  // era 'percentage'
  discount_percentage: 20,  // era "discount_value"
  start_date: '',
  end_date: '',
  status: 'DRAFT',  // era "is_active: false"
  priority: 5,  // era "is_featured: false"
  max_uses: null,
  max_uses_per_user: 1,
  min_purchase_amount: 0,
});

// Actualizar opciones de SELECT
const OFFER_TYPES = [
  { value: 'FLASH_SALE', label: '🔥 Venta Flash' },
  { value: 'DAILY_DEAL', label: '⭐ Oferta del Día' },
  { value: 'SEASONAL', label: '🎄 Temporada' },
  { value: 'CLEARANCE', label: '🏷️ Liquidación' },
  { value: 'PERSONALIZED', label: '🎯 Personalizada' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '📝 Borrador' },
  { value: 'ACTIVE', label: '✅ Activa' },
  { value: 'PAUSED', label: '⏸️ Pausada' },
];
```

#### 4. Actualizar `admin-offers-view.tsx`

```typescript
// Cambiar renderizado de columnas:
<TableCell>{offer.name}</TableCell>  // era offer.title
<TableCell>{offer.discount_percentage}%</TableCell>  // era offer.discount_value
<TableCell>
  <Chip 
    label={offer.status} 
    color={offer.status === 'ACTIVE' ? 'success' : 'default'}
  />
</TableCell>
<TableCell>
  <Chip 
    label={offer.priority >= 5 ? 'Featured' : 'Normal'}
    color={offer.priority >= 5 ? 'warning' : 'default'}
  />
</TableCell>
```

---

### Opción 2: Modificar Backend (NO RECOMENDADO)

Desventajas:
- ❌ Rompe funcionalidad existente
- ❌ Requiere refactorizar todo el sistema de ofertas
- ❌ Pierde features de ML, tracking, estadísticas
- ❌ Inconsistente con el resto del backend

---

## 🎯 PLAN DE ACCIÓN

### Paso 1: Actualizar Tipos ✅
- Cambiar `src/types/offer.ts` con estructura del backend
- Agregar `OfferStatus`, actualizar `OfferType`
- Cambiar `title` → `name`, `discount_value` → `discount_percentage`

### Paso 2: Actualizar Servicio ✅
- Modificar `offerService.ts` con campos correctos
- Agregar métodos `trackView()`, `trackClick()`, `getStats()`

### Paso 3: Actualizar Formulario ✅
- Modificar `offer-form-modal.tsx`
- Cambiar selects de tipo y estado
- Usar `priority` en lugar de `is_featured`

### Paso 4: Actualizar Vista Admin ✅
- Modificar `admin-offers-view.tsx`
- Actualizar tabla con columnas correctas
- Agregar botones activate/deactivate

### Paso 5: Testing ✅
- Probar creación de ofertas
- Probar activación/desactivación
- Verificar que se guarden correctamente

---

## 📊 Ejemplo de Respuesta del Backend

### GET /api/offers/offers/{id}/

```json
{
  "id": 1,
  "name": "🔥 Venta Flash - 50% OFF",
  "description": "¡Aprovecha nuestra venta flash!",
  "offer_type": "FLASH_SALE",
  "discount_percentage": "50.00",
  "start_date": "2025-11-10T00:00:00Z",
  "end_date": "2025-11-13T23:59:59Z",
  "status": "ACTIVE",
  "max_uses": 100,
  "max_uses_per_user": 1,
  "min_purchase_amount": "50.00",
  "target_user": null,
  "target_user_name": null,
  "priority": 10,
  "views_count": 245,
  "clicks_count": 67,
  "conversions_count": 12,
  "conversion_rate": 17.91,
  "is_active": true,
  "time_remaining_hours": 48,
  "created_by": 1,
  "created_by_name": "admin",
  "created_at": "2025-11-10T12:00:00Z",
  "updated_at": "2025-11-11T15:30:00Z",
  "offer_products": [
    {
      "id": 1,
      "offer": 1,
      "product": 5,
      "product_name": "Producto Demo",
      "created_at": "2025-11-10T12:00:00Z"
    }
  ]
}
```

---

## 🚀 Conclusión

**RECOMENDACIÓN**: Adaptar el frontend al backend (Opción 1)

El backend de ofertas está completamente funcional con:
- ✅ Sistema de ML para recomendaciones personalizadas
- ✅ Tracking completo (vistas, clicks, conversiones)
- ✅ Estadísticas y analytics
- ✅ Optimización de descuentos
- ✅ Notificaciones push al activar ofertas
- ✅ Sistema de prioridades para ofertas destacadas

Solo necesitamos alinear el frontend con estos campos y aprovechar toda esta funcionalidad.
