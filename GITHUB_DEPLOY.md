# 🚀 Guía de Despliegue con GitHub Pages

## Pasos para configurar el despliegue automático:

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "🎉 Initial commit: Fis URL Shortener for GitHub Pages"
git branch -M main
git remote add origin https://github.com/tu-usuario/fis-url.git
git push -u origin main
```

### 2. Configurar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. El workflow se ejecutará automáticamente

### 3. Tu URL será:
```
https://tu-usuario.github.io/fis-url/
```

### 4. Características de la versión GitHub Pages:

#### ✅ **Funciona:**
- Acortamiento de URLs (usando hash de la página)
- Códigos QR
- Historial local (localStorage)
- Copiar al portapapeles
- Interfaz completa y responsive

#### ⚠️ **Limitaciones:**
- No hay servidor backend (solo frontend estático)
- No autenticación con Auth0
- No base de datos persistente
- URLs se guardan solo en localStorage del navegador

#### 🌟 **Perfecto para:**
- Demo y portafolio
- Uso personal simple
- Mostrar tus habilidades de desarrollo

### 5. Para funcionalidades completas:
Si necesitas todas las funciones (Auth0, base de datos, etc.), 
considera deployar el backend en:
- **Railway** (gratis, fácil)
- **Heroku** (gratis con limitaciones)
- **Render** (gratis)

Y conectar el frontend de GitHub Pages al backend remoto.

¡Disfruta tu acortador de URLs en GitHub Pages! 🎉
