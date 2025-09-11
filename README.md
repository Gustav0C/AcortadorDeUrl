# 🔗 Fis Url - Acortador de URLs

Un acortador de URLs moderno, elegante y completamente funcional con autenti## 🌐 Despliegue

### GitHub Pages (Versión Demo)
Este proyecto incluye una versión estática optimizada para GitHub Pages:

- **URL demo**: `https://tu-usuario.github.io/fis-url/`
- **Características**: Acortamiento local, QR codes, historial en localStorage
- **Despliegue**: Automático con GitHub Actions en cada push a `main`

### Versión Completa (Backend)
Para todas las funcionalidades (Auth0, base de datos persistente), despliega en:

- **Railway** (recomendado para backend)
- **Heroku** 
- **Render**

El workflow de GitHub Actions despliega automáticamente la versión demo estática.tadísticas y generación de códigos QR.

![Fis Url](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## ✨ Características

- 🔗 **Acortamiento de URLs**: Convierte URLs largas en enlaces cortos y memorables
- 👤 **Autenticación**: Login y registro seguro con Auth0 (Google OAuth)
- 📊 **Estadísticas**: Seguimiento de clics y análisis de uso
- 📱 **Códigos QR**: Generación automática de códigos QR para enlaces cortos
- 🗂️ **Historial personal**: Gestión completa de URLs creadas (solo usuarios registrados)
- 🗑️ **Gestión de enlaces**: Eliminar URLs creadas
- 🎨 **UI moderna**: Interfaz minimalista, responsive y con animaciones
- 🔒 **Seguro**: Headers de seguridad y validación de URLs
- 💾 **Base de datos local**: SQLite para funcionamiento completamente independiente

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
   git clone https://github.com/tu-usuario/fis-url.git
   cd fis-url
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
   
   # Base de datos
   DB_PATH='./urls.db'
   
   # Puerto del servidor
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

- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite3
- **Autenticación**: Auth0 con Google OAuth
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Generación de QR**: qrcode library
- **Generación de IDs**: shortid library

## 📁 Estructura del proyecto

```
fis-url/
├── public/              # Archivos estáticos del frontend
│   ├── index.html       # Página principal
│   ├── styles.css       # Estilos CSS
│   └── script.js        # Lógica JavaScript del frontend
├── server.js            # Servidor principal de Express
├── package.json         # Dependencias y scripts de npm
├── .env.example         # Ejemplo de variables de entorno
└── README.md           # Este archivo
```

## � Despliegue

Este proyecto está configurado para desplegarse automáticamente usando GitHub Actions en plataformas como:

- **Vercel** (recomendado)
- **Netlify**
- **Railway**
- **Heroku**

El workflow de GitHub Actions se ejecuta automáticamente en cada push a la rama `main`.

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, por favor abre un issue primero para discutir qué te gustaría cambiar.

## 📞 Soporte

Si tienes algún problema o pregunta, por favor abre un [issue](https://github.com/tu-usuario/fis-url/issues) en GitHub.

---

Hecho con ❤️ por [Tu Nombre]
- ✅ Generar códigos QR

#### Con autenticación
- ✅ Todas las funcionalidades anteriores
- ✅ URLs privadas por usuario
- ✅ Solo puedes ver y eliminar tus propias URLs
- ✅ Perfil de usuario visible
- ✅ Historial personalizado

## 📁 Estructura del proyecto

```
fis-url/
├── package.json          # Configuración de dependencias y scripts
├── server.js             # Servidor principal con Auth0
├── .env                  # Variables de entorno (Auth0 config)
├── urls.db              # Base de datos SQLite (se crea automáticamente)
├── README.md            # Este archivo
└── public/              # Frontend
    ├── index.html       # Interfaz principal con autenticación
    ├── styles.css       # Estilos CSS modernos
    └── script.js        # JavaScript con Auth0 integration
```

## 🔌 API Endpoints

- `POST /api/shorten` - Acortar URL
- `GET /api/urls` - Listar URLs del usuario
- `DELETE /api/urls/:code` - Eliminar URL
- `GET /api/qr/:code` - Generar código QR
- `GET /api/stats/:code` - Estadísticas de la URL
- `GET /api/user` - Información del usuario autenticado
- `GET /login` - Iniciar sesión con Auth0
- `GET /logout` - Cerrar sesión
- `GET /:code` - Redireccionar a URL original

## 🛠️ Tecnologías utilizadas

- **Backend:** Node.js, Express.js, express-openid-connect
- **Base de datos:** SQLite
- **Autenticación:** Auth0
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Otras:** QRCode.js, ShortID, dotenv

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

## 🔄 Personalización

### Cambiar el puerto
Edita el archivo `.env`:
```env
PORT=3000
```

### Personalizar códigos cortos
El proyecto usa `shortid` para generar códigos únicos. Puedes cambiar esto en `server.js`:
```javascript
const shortCode = shortid.generate();
```

## � Solución de problemas

### Error de Auth0
- Verifica que las URLs en Auth0 coincidan exactamente
- Asegúrate de que todas las variables de `.env` estén configuradas
- Revisa que el `AUTH0_SECRET` tenga al menos 32 caracteres

### Base de datos
- Si hay problemas, elimina `urls.db` y reinicia el servidor
- La base de datos se recrea automáticamente

### Puerto ocupado
- Cambia el puerto en `.env` o cierra la aplicación que usa el puerto 3000

### El servidor no inicia
- Verifica que Node.js esté instalado: `node --version`
- Verifica que las dependencias estén instaladas: `npm install`

### Error de base de datos
- Elimina el archivo `urls.db` y reinicia el servidor
- Se creará una nueva base de datos automáticamente

### URLs no funcionan
- Verifica que las URLs tengan `http://` o `https://`
- El validador requiere URLs completas y válidas

## 🚀 Próximas mejoras

- [ ] Códigos personalizados
- [ ] Fechas de expiración
- [ ] Exportar estadísticas
- [ ] Temas de interfaz
- [ ] API REST completa
- [ ] Autenticación (opcional)

## 📄 Licencia

ISC License - Proyecto de código abierto para uso personal y educativo.

---

¡Disfruta tu acortador de URLs local! 🎉
