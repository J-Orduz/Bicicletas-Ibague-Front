# 🎨 Guía de Implementación de Temas - Bicibague Frontend

### 1. **Custom Hook: `useTheme`**
- Maneja el estado del tema (light/dark)
- Detecta preferencia del sistema operativo
- Persiste la selección en `localStorage`
- Aplica el tema mediante el atributo `data-theme` en el HTML

### 2. **CSS Variables (Custom Properties)**
- Sistema centralizado de colores y estilos
- Cambio dinámico sin recargar la página
- Transiciones suaves entre temas

### 3. **UI Toggle Button**
- Botón en el Header con emojis (🌙/☀️)
- Accesible con `aria-label`
- Animaciones de hover y click

---

## 📋 Mejores Prácticas Implementadas

### ✅ CSS Variables sobre SASS Variables
**Por qué:**
- Las variables SASS (`$variable`) son estáticas (compiladas)
- Las CSS Variables (`--variable`) son dinámicas (cambian en runtime)
- Permiten cambios de tema sin recargar

### ✅ `data-theme` Attribute
**Por qué:**
- Método estándar y limpio
- Un solo lugar para cambiar el tema
- Fácil de debuggear en DevTools

### ✅ localStorage
**Por qué:**
- Persiste la preferencia del usuario
- Mejora la UX (recordar preferencia)

### ✅ Detección de Preferencia del Sistema
```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches
```
- Respeta la configuración del SO del usuario
- Primera vez sin localStorage usa esta

---

## 🎯 Consejos para Continuar el Desarrollo

### 1. **Usar SIEMPRE CSS Variables en Componentes Nuevos**

❌ **EVITAR:**
```scss
.mi-componente {
  background-color: #ffffff;  // Color hardcodeado
  color: #212529;
}
```

✅ **CORRECTO:**
```scss
.mi-componente {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}
```

### 2. **Variables Disponibles**

#### Colores Principales:
- `--primary-color`: Color principal de la marca
- `--primary-color-dark`: Versión más oscura para hover
- `--secondary-color`: Color secundario
- `--accent-color`: Color de acento/énfasis

#### Fondos:
- `--bg-primary`: Fondo principal
- `--bg-secondary`: Fondo secundario (secciones, cards)
- `--bg-tertiary`: Fondo terciario (sidebar, footer)

#### Textos:
- `--text-primary`: Texto principal
- `--text-secondary`: Texto secundario (subtítulos, metadata)
- `--text-inverse`: Texto inverso (para fondos oscuros)

#### Utilidades:
- `--border-color`: Color de bordes
- `--shadow-sm/md/lg`: Sombras en 3 tamaños
- `--transition-fast/normal`: Transiciones predefinidas

### 3. **Agregar Nuevas Variables**

Cuando necesites un nuevo color, agrégalo en `_variables.scss`:

```scss
:root {
  --mi-nuevo-color: #abc123;
}

[data-theme='dark'] {
  --mi-nuevo-color: #def456;
}
```

### 4. **Estructura de Componentes con Temas**

```scss
.mi-nuevo-componente {
  // Colores base del tema
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  
  // Transiciones para cambio suave
  transition: all var(--transition-normal);
  
  // Bordes y sombras
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  
  // Estados hover
  &:hover {
    background-color: var(--bg-tertiary);
    box-shadow: var(--shadow-md);
  }
}
```

### 5. **Testing de Temas**

Siempre prueba tus componentes en ambos temas:
1. Click en el botón de tema (🌙/☀️)
2. Verifica que todos los colores se vean bien
3. Revisa que los contrastes sean legibles

### 6. **Agregar Más Variables de Utilidad**

Si necesitas más variables (espaciados, radios, etc.):

```scss
:root {
  // Espaciados
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  // Border radius
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  // Fuentes
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
}
```

### 7. **Context API (Opcional para Proyectos Grandes)**

Si el proyecto crece y múltiples componentes necesitan acceso al tema:

```jsx
// ThemeContext.jsx
import { createContext, useContext } from 'react';
import { useTheme } from '@hooks/useTheme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = useTheme();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
```

---

## 🔧 Cómo Extender el Sistema

### Agregar un Tercer Tema (ej. "high-contrast")

1. En `_variables.scss`:
```scss
[data-theme='high-contrast'] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --primary-color: #ffff00;
  // ...
}
```

2. En `useTheme.js`:
```javascript
const [theme, setTheme] = useState('light'); // o 'dark' o 'high-contrast'

const cycleTheme = () => {
  const themes = ['light', 'dark', 'high-contrast'];
  const currentIndex = themes.indexOf(theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
};
```

---

## 🎨 Paletas de Colores Recomendadas

### Para Modo Oscuro:
- Fondos: Grises oscuros (#1a1a1a, #2d2d2d) NO negro puro
- Textos: Grises claros (#e9ecef) NO blanco puro
- Colores más vibrantes que en modo claro

### Para Modo Claro:
- Fondos: Blancos y grises muy claros
- Textos: Grises oscuros
- Colores más sutiles

---

## 📱 Accesibilidad

### Contraste de Colores:
- Mínimo ratio 4.5:1 para texto normal (WCAG AA)
- Mínimo ratio 3:1 para texto grande y UI
- Usa herramientas: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing:
```javascript
// Puedes agregar esto en dev tools console
const checkContrast = (bg, text) => {
  // Implementar check de contraste
  console.log('Ratio:', ratio);
};
```

---

## ⚡ Performance

### Optimizaciones Aplicadas:
1. **CSS Variables** - Cambio instantáneo sin re-render
2. **Transiciones CSS** - Hardware accelerated
3. **localStorage** - Evita flash de tema incorrecto
4. **Single Hook** - Un solo estado para toda la app

---

## 🐛 Troubleshooting

### Problema: Los colores no cambian
- ✅ Verifica que uses `var(--variable)` no `$variable`
- ✅ Inspecciona en DevTools que `data-theme` cambie en `<html>`

### Problema: Flash de tema incorrecto al cargar
- ✅ Agregar script inline en `index.html` (opcional):
```html
<script>
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
</script>
```

### Problema: Alias `@hooks` no funciona
- ✅ Reinicia el servidor de desarrollo
- ✅ Verifica `vite.config.js`

---

## 📚 Recursos Adicionales

- [CSS Variables MDN](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## ✅ Checklist para Nuevos Componentes

- [ ] Usar CSS Variables para todos los colores
- [ ] Agregar `transition` para cambios suaves
- [ ] Probar en ambos temas (light/dark)
- [ ] Verificar contraste de colores
- [ ] Evitar colores hardcodeados
- [ ] Usar variables de spacing/radius si existen

---

¡Listo! Con este sistema tendrás un manejo de temas profesional, escalable y fácil de mantener. 🚀
