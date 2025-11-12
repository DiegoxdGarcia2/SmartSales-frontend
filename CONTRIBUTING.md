# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a SmartSales! Este documento te guiará a través del proceso.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guía de Estilo](#guía-de-estilo)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables.

---

## 🚀 ¿Cómo Puedo Contribuir?

### 🐛 Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

- **Título descriptivo**
- **Pasos para reproducir** el problema
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** (si aplica)
- **Información del entorno**: OS, navegador, versión de Node

**Ejemplo**:
```markdown
## Bug: Notificaciones no llegan en Chrome

**Descripción**: Las notificaciones push no se muestran en Chrome después de aceptar permisos.

**Pasos para reproducir**:
1. Iniciar sesión
2. Aceptar permisos de notificaciones
3. Enviar notificación de prueba desde backend

**Comportamiento esperado**: Notificación emergente
**Comportamiento actual**: No aparece nada

**Entorno**:
- OS: Windows 11
- Navegador: Chrome 120
- Node: v20.10.0
```

### ✨ Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. **Revisa issues existentes** para evitar duplicados
2. **Crea un nuevo issue** con la etiqueta `enhancement`
3. **Describe la funcionalidad** en detalle
4. **Explica el caso de uso** y beneficios

### 🔧 Contribuir con Código

1. **Fork** el repositorio
2. **Crea una rama** desde `main`
3. **Implementa** tus cambios
4. **Escribe tests** (si aplica)
5. **Commit** con mensaje descriptivo
6. **Push** a tu fork
7. **Abre un Pull Request**

---

## 💻 Proceso de Desarrollo

### 1. Setup del Proyecto

```bash
# Fork y clonar
git clone https://github.com/TU_USUARIO/SmartSales-frontend.git
cd smartsales-frontend

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo
pnpm dev
```

### 2. Crear una Rama

```bash
# Nombres de rama sugeridos:
git checkout -b feature/nueva-funcionalidad    # Nueva funcionalidad
git checkout -b fix/corregir-bug              # Corrección de bug
git checkout -b docs/actualizar-readme        # Documentación
git checkout -b refactor/optimizar-codigo     # Refactorización
```

### 3. Hacer Cambios

- **Sigue la guía de estilo** del proyecto
- **Escribe código limpio** y bien documentado
- **Añade comentarios** cuando sea necesario
- **Actualiza documentación** si cambias APIs

### 4. Testing

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Build
pnpm build

# Verificar que todo funciona
pnpm preview
```

### 5. Commit y Push

```bash
# Staging
git add .

# Commit (ver guía de mensajes abajo)
git commit -m "feat: agregar búsqueda de productos"

# Push
git push origin feature/nueva-funcionalidad
```

---

## 🎨 Guía de Estilo

### TypeScript

```typescript
// ✅ CORRECTO
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ❌ INCORRECTO
const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

### React Components

```typescript
// ✅ CORRECTO - Componente funcional con tipos
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card>
      <CardMedia image={product.image} />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Button onClick={() => onAddToCart(product)}>
          Agregar al Carrito
        </Button>
      </CardContent>
    </Card>
  );
}

// ❌ INCORRECTO - Sin tipos
export function ProductCard({ product, onAddToCart }) {
  // ...
}
```

### Hooks Personalizados

```typescript
// ✅ CORRECTO
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { products, loading, refetch: loadProducts };
}
```

### Servicios

```typescript
// ✅ CORRECTO - Servicio con tipos y manejo de errores
class ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products/');
      return response.data.results;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}

export default new ProductService();
```

### CSS/Styling

```typescript
// ✅ CORRECTO - Usar sx prop de MUI
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 1,
  }}
>
  {/* contenido */}
</Box>

// ✅ TAMBIÉN CORRECTO - Styled components para estilos complejos
const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));
```

---

## 📝 Commit Messages

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **perf**: Mejoras de rendimiento
- **test**: Agregar o corregir tests
- **chore**: Tareas de mantenimiento

### Ejemplos

```bash
# Nuevas funcionalidades
git commit -m "feat(offers): agregar filtro por categoría"
git commit -m "feat(notifications): implementar push notifications"

# Correcciones
git commit -m "fix(cart): corregir cálculo de total"
git commit -m "fix(auth): manejar token expirado"

# Documentación
git commit -m "docs(readme): actualizar instrucciones de instalación"

# Refactorización
git commit -m "refactor(services): simplificar API client"

# Rendimiento
git commit -m "perf(dashboard): optimizar carga de gráficos"
```

---

## 🔀 Pull Requests

### Checklist

Antes de abrir un PR, verifica:

- [ ] El código compila sin errores (`pnpm build`)
- [ ] Pasa linting (`pnpm lint`)
- [ ] Pasa type checking (`pnpm type-check`)
- [ ] Tests funcionan (si aplica)
- [ ] Documentación actualizada
- [ ] Commits siguen convención
- [ ] Rama actualizada con `main`

### Título del PR

```
feat(offers): agregar sistema de filtros avanzados
fix(notifications): corregir error al cargar notificaciones
docs(contributing): agregar guía de commits
```

### Descripción del PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## ¿Cómo se probó?
Describe cómo probaste los cambios.

## Screenshots (si aplica)
Agregar capturas de pantalla.

## Checklist
- [ ] Mi código sigue la guía de estilo
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
```

### Revisión de Código

- **Sé constructivo**: Da feedback útil y específico
- **Sé respetuoso**: Todos estamos aprendiendo
- **Explica el por qué**: No solo digas qué cambiar

---

## 🏗️ Estructura de Proyecto

Al agregar nuevos archivos, sigue esta estructura:

```
src/
├── components/          # Componentes reutilizables
│   └── mi-componente/
│       ├── index.ts
│       └── mi-componente.tsx
│
├── services/           # Lógica de negocio
│   └── miService.ts
│
├── types/              # Definiciones de tipos
│   └── miTipo.ts
│
├── hooks/              # Custom hooks
│   └── useMiHook.ts
│
├── pages/              # Páginas
│   └── mi-pagina.tsx
│
└── sections/           # Secciones complejas
    └── mi-seccion/
        └── view/
            └── mi-seccion-view.tsx
```

---

## 🧪 Testing (Futuro)

Cuando se implementen tests:

```typescript
// Ejemplo de test con React Testing Library
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { id: 1, name: 'Test Product', price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

---

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## ❓ ¿Preguntas?

Si tienes preguntas:

1. Revisa la [documentación](./docs/)
2. Busca en [Issues existentes](https://github.com/DiegoxdGarcia2/SmartSales-frontend/issues)
3. Crea un nuevo issue con la etiqueta `question`

---

¡Gracias por contribuir a SmartSales! 🎉
