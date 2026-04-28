# 🔗 Fis Url - Acortador de URLs

Un acortador de URLs moderno y completamente funcional con autenticación opcional, estadísticas y generación de códigos QR.

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## ✨ Características

- 🔗 **Acortamiento de URLs** - Convierte URLs largas en enlaces cortos
- 👤 **Autenticación opcional** - Login con Auth0 (Google OAuth)
- 📊 **Estadísticas** - Seguimiento de clics
- 📱 **Códigos QR** - Generación automática de códigos QR
- 🗂️ **Historial** - Gestión de URLs creadas (usuarios registrados)
- 🎨 **UI moderna** - Interfaz responsiva con animaciones
- 🔒 **Seguro** - Headers de seguridad, rate limiting y validación

## 🚀 Demo
<img width="1918" height="911" alt="Portafolioimage" src="https://github.com/user-attachments/assets/02997cec-7123-4540-a002-eda068644d49" />

**[Ver demo en vivo](https://fis-url.vercel.app)**

## 🖥️ Instalación local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18+)

### Pasos

```bash
# Clonar repositorio
git clone https://github.com/Gustav0C/AcortadorDeUrl.git
cd AcortadorDeUrl

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Crear archivo .env con credenciales de Auth0

# Iniciar servidor
npm start

# Abrir navegador
http://localhost:3000
```

### Variables de entorno (.env)

```env
# Puerto del servidor
PORT=3000

# Auth0 (opcional - sin esto funciona en modo anónimo)
AUTH0_SECRET=tu-secret-largo-y-aleatorio
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=tu-client-id
AUTH0_CLIENT_SECRET=tu-client-secret
AUTH0_ISSUER_BASE_URL=https://tu-tenant.auth0.com
```

## 🌐 Deployment en Vercel

1. **Fork** este repositorio
2. Ve a [Vercel](https://vercel.com) y conecta tu cuenta de GitHub
3. Importa el proyecto
4. (Opcional) Configura las variables de entorno de Auth0

El deployment es automático desde GitHub.

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Acortar URL `{url: "..."}` |
| `GET` | `/api/urls` | Listar URLs del usuario |
| `DELETE` | `/api/urls/:code` | Eliminar URL |
| `GET` | `/api/qr/:code` | Generar código QR |
| `GET` | `/api/stats/:code` | Estadísticas de clicks |
| `GET` | `/:code` | Redireccionar a URL original |

## 📁 Estructura del proyecto

```
AcortadorDeUrl/
├── server.js          # Servidor Express
├── vercel.json       # Configuración Vercel
├── package.json      # Dependencias
├── public/
│   ├── index.html    # Interfaz
│   ├── styles.css    # Estilos
│   └── script.js     # Frontend JS
└── README.md
```

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite3
- **Autenticación**: Auth0 (opcional)
- **Frontend**: HTML5, CSS3, Vanilla JS
- **QR**: qrcode library
- **Seguridad**: helmet, express-rate-limit

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

ISC License

---

⭐ ¿Te gustó? ¡Dale una estrella en GitHub!

Desarrollado con ❤️ por [Gustav0C](https://github.com/Gustav0C)
