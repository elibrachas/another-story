# Instalación del LinkTree en Crónicas Laborales

## 📋 Pasos para integrar sin sobrescribir tu proyecto

### 1. Estructura de archivos recomendada

Copia estos archivos a tu proyecto de Crónicas Laborales manteniendo esta estructura:

\`\`\`
tu-proyecto-cronicas-laborales/
├── components/
│   └── link-tree/
│       ├── components/
│       │   ├── header.tsx
│       │   ├── profile-view.tsx
│       │   ├── edit-view.tsx
│       │   ├── links-form.tsx
│       │   ├── profile-form.tsx
│       │   ├── theme-form.tsx
│       │   └── verified-badge.tsx
│       ├── hooks/
│       │   ├── use-profile.tsx
│       │   ├── use-links.tsx
│       │   └── use-theme-settings.tsx
│       ├── ui/
│       │   ├── card-flip.tsx
│       │   └── (otros componentes UI específicos)
│       ├── config/
│       │   └── profile.ts
│       └── link-tree.tsx
├── pages/
│   └── links.tsx (si usas Pages Router)
└── app/
    └── links/
        └── page.tsx (si usas App Router)
\`\`\`

### 2. Dependencias necesarias

Asegúrate de tener estas dependencias en tu `package.json`:

\`\`\`json
{
  "dependencies": {
    "next-themes": "^0.2.1",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-select": "^1.2.2",
    "lucide-react": "^0.263.1"
  }
}
\`\`\`

### 3. Estilos CSS

Añade estos estilos a tu archivo CSS global (sin sobrescribir los existentes):

\`\`\`css
/* LinkTree specific styles - añadir al final de tu globals.css */

/* Card flip animation styles */
.perspective {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
  transition: height var(--animation-speed) ease;
}

.backface-hidden {
  backface-visibility: hidden;
  width: 100%;
  top: 0;
  left: 0;
}

.rotateY-180 {
  transform: rotateY(180deg);
}

/* Background patterns */
.pattern-dots {
  background-image: radial-gradient(var(--pattern-color) 1px, transparent 1px);
  background-size: calc(10 * 1px) calc(10 * 1px);
}

.pattern-grid {
  background-image: linear-gradient(to right, var(--pattern-color) 1px, transparent 1px),
    linear-gradient(to bottom, var(--pattern-color) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Glassmorphism effect */
.glassmorphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.dark .glassmorphism {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
\`\`\`

### 4. Configuración de rutas

#### Si usas App Router (Next.js 13+):
Crea el archivo `app/links/page.tsx`

#### Si usas Pages Router:
Crea el archivo `pages/links.tsx`

### 5. Variables CSS personalizadas

Añade estas variables CSS a tu `:root` (sin sobrescribir las existentes):

\`\`\`css
:root {
  /* LinkTree specific variables */
  --animation-speed: 400ms;
  --card-opacity: 1;
  --card-border-radius: 0.5rem;
  --hover-bg: rgba(0, 0, 0, 0.05);
  --pattern-color: rgba(0, 0, 0, 0.1);
  --icon-text-color: 255, 255, 255;
}

.dark {
  --hover-bg: rgba(255, 255, 255, 0.1);
  --pattern-color: rgba(255, 255, 255, 0.1);
}
\`\`\`

### 6. Verificación

Después de la instalación:

1. ✅ Verifica que tu sitio principal sigue funcionando
2. ✅ Visita `/links` para ver el LinkTree
3. ✅ Prueba el modo de edición
4. ✅ Verifica que los temas funcionan correctamente

### 7. Personalización

- **Avatar**: Coloca tu foto en `/public/images/eli-brachas-avatar.jpg`
- **Enlaces**: Modifica `components/link-tree/config/profile.ts`
- **Colores**: Usa el editor de temas integrado
- **Navegación**: El botón "Volver" apunta a tu sitio principal

## 🚨 Importante

- **NO sobrescribas** archivos existentes de tu proyecto
- **Mantén** la estructura de carpetas sugerida
- **Prueba** en desarrollo antes de hacer deploy
- **Haz backup** de tu proyecto antes de integrar

## 🆘 Solución de problemas

Si algo no funciona:

1. Verifica que todas las dependencias estén instaladas
2. Revisa que los imports apunten a las rutas correctas
3. Asegúrate de que los estilos CSS se hayan añadido correctamente
4. Verifica que la ruta `/links` esté configurada correctamente
\`\`\`

Finalmente, creo un componente wrapper que evite conflictos con tu tema existente:
