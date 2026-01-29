# Ñammy - Food & Business Social Discovery PWA

## 🍕 Descripción

**Ñammy** es una PWA (Progressive Web App) social para descubrir y conectar con los mejores productos y servicios locales en Colombia. Explora restaurantes, farmacias, tiendas y más con una experiencia móvil optimizada.

## ✨ Características

- 📱 **Mobile-First**: Diseño optimizado para dispositivos móviles
- 🔄 **PWA Completa**: Instalable, offline-ready con Service Worker
- 🎨 **UI Optimizada**: Grid denso, tarjetas compactas, logo optimizado
- 💬 **WhatsApp Integration**: Contacto directo con negocios
- 🧡 **Tema Naranja**: Colores vibrantes y modernos
- ⚡ **Performance**: Carga rápida con estrategia Network First

## 🚀 Tecnologías

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Estilos**: Tailwind CSS + CSS personalizado
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Lucide Icons
- **Fonts**: Google Fonts (Poppins)
- **Deployment**: Vercel

## 🛠️ Desarrollo

### Instalación
```bash
git clone https://github.com/nodusestudio/nammy-app.git
cd nammy-app
npm install
```

### Ejecutar localmente
```bash
npm start  # Puerto 3001
```

### Deploy a producción
```bash
npm run deploy
```

## 📂 Estructura del Proyecto

```
nammy-app/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── style.css          # Estilos personalizados
├── sw.js              # Service Worker
├── manifest.json      # PWA Manifest
├── logo.png           # Logo principal
├── package.json       # Dependencias
└── icons/            # Iconos PWA
    ├── icon-72x72.png
    ├── icon-192x192.png
    └── ...
```

## 🎯 Funcionalidades

- **Categorías**: Para Ti, Restaurantes, Farmacias, Tiendas
- **Feed Social**: Cards con productos y servicios
- **Sistema de Likes**: Persistencia local
- **WhatsApp Integration**: Contacto directo
- **PWA Features**: Instalable, offline, notificaciones

## 🔧 Optimizaciones Implementadas

### Service Worker
- ✅ Estrategia **Network First**
- ✅ Manejo robusto de errores
- ✅ Fallbacks para imágenes
- ✅ Cache selectivo

### UI/UX
- ✅ Grid optimizado: `minmax(150px, 1fr)`
- ✅ Gap reducido: `8px`
- ✅ Logo: `height: 32px`
- ✅ Tarjetas compactas: `padding: 8px`
- ✅ Fuente optimizada: `14px`

## 📱 Responsive

- **Mobile**: 140px+ columns, gap 6px
- **Desktop**: 180px+ columns, gap 12px
- **Optimizado** para todas las pantallas

## 🚀 Deploy

El proyecto está configurado para deploy automático en Vercel:

```bash
vercel --prod
```

## 📄 Licencia

MIT License - Nodus Studio

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una feature branch
3. Commit tus cambios
4. Push a la branch
5. Abre un Pull Request

## 📞 Contacto

- **Website**: [nammy-app.vercel.app](https://nammy-app.vercel.app)
- **Repositorio**: [github.com/nodusestudio/nammy-app](https://github.com/nodusestudio/nammy-app)
- **Autor**: Nodus Studio

---

**¡Disfruta explorando con Ñammy!** 🍕✨