# Eli Brachas - Página de Enlaces

Esta es una implementación personalizada de una página de enlaces (similar a Linktree) integrada en el sitio web de Crónicas Laborales.

## Ubicación
- URL: `https://cronicaslaborales.com/links`
- Ruta del archivo: `/app/links/page.tsx`

## Características

### ✨ Funcionalidades
- **Modo de edición**: Permite editar perfil y enlaces en tiempo real
- **Temas personalizables**: Múltiples opciones de colores y estilos
- **Responsive**: Optimizado para móviles y desktop
- **Iconos automáticos**: Detecta automáticamente el tipo de enlace
- **Efectos visuales**: Glassmorphism, sombras, patrones de fondo

### 🎨 Personalización
- **Colores**: 8 temas de color diferentes
- **Tipografías**: Sans, Serif, y Monospace
- **Patrones de fondo**: Puntos, rejillas, rayas, ondas, hexágonos
- **Efectos**: Sombras, transparencias, animaciones

### 🔗 Enlaces por defecto
1. **Crónicas Laborales** - Sitio web principal
2. **GitHub** - Perfil de desarrollador
3. **LinkedIn** - Red profesional
4. **Portfolio Personal** - Sitio personal
5. **Twitter/X** - Red social
6. **Email** - Contacto directo

## Configuración

### Actualizar información personal
Edita el archivo `config/profile.ts` para cambiar:
- Nombre y biografía
- URLs de redes sociales
- Email de contacto
- Avatar

### Añadir nuevos enlaces
Usa el modo de edición en la interfaz o modifica directamente el array `defaultLinks` en `components/link-tree.tsx`.

### Personalizar estilos
Los temas se pueden modificar en `hooks/use-theme-settings.tsx` y los estilos CSS en `app/globals.css`.

## Integración con Crónicas Laborales

- **Navegación**: Incluye enlace de regreso al sitio principal
- **Branding**: Mantiene consistencia con la marca
- **SEO**: Optimizado para motores de búsqueda
- **Meta tags**: Configurados para redes sociales

## Tecnologías utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos
- **next-themes** - Soporte para tema oscuro

## Deployment

Esta página se despliega junto con el resto del sitio de Crónicas Laborales. No requiere configuración adicional.
