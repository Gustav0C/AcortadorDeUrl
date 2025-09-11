# 🔗 Fis Url - Acortador de URLs

Un acortador de URLs moderno, elegante y completamente funcional con autenticación,## 🚀 Deployment en Vercel

Este proyecto está optimizado para desplegarse en **Vercel**:

### Deploy automático
1. **Fork** este repositorio en tu GitHub
2. Ve a [Vercel](https://vercel.com) y conecta tu cuenta de GitHub
3. Importa el proyecto y configura las variables de entorno:
   ```
   AUTH0_SECRET=tu-secret-largo-y-aleatorio
   AUTH0_CLIENT_ID=tu-client-id-de-auth0
   AUTH0_CLIENT_SECRET=tu-client-secret-de-auth0
   AUTH0_ISSUER_BASE_URL=https://tu-tenant.auth0.com
   ```
4. En Auth0, actualiza las URLs permitidas con tu dominio de Vercel:
   - **Allowed Callback URLs**: `https://tu-app.vercel.app/callback`
   - **Allowed Logout URLs**: `https://tu-app.vercel.app`
   - **Allowed Web Origins**: `https://tu-app.vercel.app`

### Deploy manual
```bash
npm install -g vercel
vercel --prod
```

> **Nota**: El proyecto incluye `vercel.json` con la configuración necesaria para el deployment.

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Acortar URL (requiere JSON: {url: "..."}) |
| `GET` | `/api/urls` | Listar URLs del usuario autenticado |
| `DELETE` | `/api/urls/:code` | Eliminar URL específica |
| `GET` | `/api/qr/:code` | Generar código QR para URL |
| `GET` | `/api/stats/:code` | Estadísticas de clicks de la URL |
| `GET` | `/api/user` | Información del usuario autenticado |
| `GET` | `/login` | Iniciar sesión con Auth0 |
| `GET` | `/logout` | Cerrar sesión |
| `GET` | `/:code` | Redireccionar a URL original |cas y generación de códigos QR.

![Fis Url](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## 🌐 **Demo en vivo**
🚀 **[Ver demo](https://acortador-de-url-alpha.vercel.app)**

## ✨ Características

- 🔗 **Acortamiento de URLs**: Convierte URLs largas en enlaces cortos y memorables
- 👤 **Autenticación**: Login y registro seguro con Auth0 (Google OAuth)
- 📊 **Estadísticas**: Seguimiento de clics y análisis de uso
- 📱 **Códigos QR**: Generación automática de códigos QR para enlaces cortos
- 🗂️ **Historial personal**: Gestión completa de URLs creadas (solo usuarios registrados)
- 🗑️ **Gestión de enlaces**: Eliminar URLs creadas
- 🎨 **UI moderna**: Interfaz minimalista, responsive y con animaciones
- 🔒 **Seguro**: Headers de seguridad y validación de URLs
- 💾 **Base de datos**: SQLite para funcionamiento independiente

## 🖥️ Vista previa

### Para usuarios anónimos:
- Acortamiento temporal de URLs
- Generación de códigos QR
- Mensaje promocional para registrarse

### Para usuarios registrados:
- Todas las funciones anteriores
- Historial completo de URLs
- Gestión y eliminación de enlaces
- Avatar personalizado de Google

## � Instalación y uso local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (incluido con Node.js)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/AcortadorDeUrl.git
   cd AcortadorDeUrl
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   # Auth0 Configuration (opcional - sin esto funciona en modo anónimo)
   AUTH0_SECRET='tu-secret-largo-y-aleatorio-aqui'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_CLIENT_ID='tu-client-id-de-auth0'
   AUTH0_CLIENT_SECRET='tu-client-secret-de-auth0'
   AUTH0_ISSUER_BASE_URL='https://tu-tenant.auth0.com'
   
   # Puerto del servidor (opcional)
   PORT=3000
   ```

4. **Inicia el servidor**
   ```bash
   npm start
   ```

5. **Abre tu navegador**
   
   Ve a `http://localhost:3000` y ¡comienza a acortar URLs!

## ⚙️ Configuración de Auth0 (Opcional)

Si quieres habilitar la autenticación y el historial personal:

1. Crea una cuenta gratuita en [Auth0](https://auth0.com)
2. Crea una nueva aplicación "Regular Web Application"
3. Configura las URLs permitidas:
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Copia las credenciales a tu archivo `.env`

Sin Auth0, la aplicación funciona perfectamente en modo anónimo.

## 🛠️ Tecnologías utilizadas

- **Backend**: Node.js, Express.js, express-openid-connect
- **Base de datos**: SQLite3 (compatible con Vercel)
- **Autenticación**: Auth0 (Google OAuth)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Generación de QR**: qrcode library
- **Deployment**: Vercel con integración continua
- **Otras**: ShortID, dotenv, CORS

## 📁 Estructura del proyecto

```
AcortadorDeUrl/
├── package.json          # Configuración de dependencias y scripts
├── server.js             # Servidor principal con Auth0
├── vercel.json           # Configuración de deployment en Vercel
├── .env                  # Variables de entorno (Auth0 config)
├── urls.db              # Base de datos SQLite (se crea automáticamente)
├── README.md            # Este archivo
└── public/              # Frontend
    ├── index.html       # Interfaz principal con autenticación
    ├── styles.css       # Estilos CSS modernos
    ├── script.js        # JavaScript con Auth0 integration
    └── logo.png         # Logo del proyecto
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas:
- 🐛 [Reporta bugs](https://github.com/tu-usuario/AcortadorDeUrl/issues)
- 💡 [Solicita features](https://github.com/tu-usuario/AcortadorDeUrl/issues)
- 📧 Contacto directo: Gcanales58@gmail.com

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

##  Base de datos

El proyecto usa SQLite con la siguiente estructura actualizada:

```sql
CREATE TABLE urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicks INTEGER DEFAULT 0,
    last_accessed DATETIME,
    user_id TEXT DEFAULT NULL  -- Para Auth0 user identification
);
```

## 🌐 Ejemplos de uso

### Acortar una URL (sin autenticación)
1. Abre `http://localhost:3000`
2. Ingresa la URL: `https://www.ejemplo.com/una-url-muy-larga`
3. Haz click en "Acortar"
4. Obtienes: `http://localhost:3000/abc123`

### Usar con autenticación
1. Haz click en "Iniciar Sesión"
2. Autentícate con Auth0
3. Ahora tus URLs serán privadas
4. Solo tú podrás ver y eliminar tus URLs

## 🛡️ Seguridad

- ✅ Autenticación Auth0
- ✅ URLs privadas por usuario
- ✅ Validación de URLs
- ✅ Sanitización de entrada
- ✅ Manejo de errores
- ✅ Variables de entorno para secrets

## 🚀 Próximas mejoras

- [ ] Códigos personalizados
- [ ] Fechas de expiración  
- [ ] Exportar estadísticas
- [ ] Analítica avanzada
- [ ] Temas personalizables

---

⭐ **¿Te gustó el proyecto?** ¡Dale una estrella en GitHub!

Desarrollado con ❤️ usando Node.js y Auth0
