# GitHub Pages Configuration

# Para que funcione en GitHub Pages necesitamos hacer algunos ajustes:

## 1. Estructura del proyecto para GitHub Pages
- GitHub Pages servirá archivos estáticos desde la carpeta `_site`
- El servidor Node.js NO funcionará en GitHub Pages (solo archivos estáticos)
- Necesitamos convertir a una aplicación frontend pura

## 2. Opciones para GitHub Pages:

### Opción A: Solo frontend (sin base de datos)
- Usar localStorage para guardar URLs temporalmente
- Sin autenticación
- URLs se pierden al limpiar navegador

### Opción B: Frontend + API externa
- Frontend en GitHub Pages
- Backend en otro servicio (Railway, Heroku, etc.)
- APIs funcionando normalmente

### Opción C: Aplicación híbrida
- Funcionalidades básicas sin servidor
- Links a servicios externos para funciones avanzadas

## Recomendación:
Para GitHub Pages, es mejor usar la Opción B:
- Frontend en GitHub Pages (tu-usuario.github.io/fis-url)
- Backend en Railway/Heroku (gratis)
- Mejor experiencia de usuario
