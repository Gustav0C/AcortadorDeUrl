require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Usar nanoid si está disponible, si no usar shortid como fallback
let generateShortCode;
try {
    const { customAlphabet } = require('nanoid');
    const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
    generateShortCode = () => nanoid();
} catch (e) {
    // Fallback a shortid si nanoid falla (Vercel)
    const shortid = require('shortid');
    generateShortCode = () => shortid.generate();
}

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const validator = require('url-validator');
const QRCode = require('qrcode');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Función para obtener la URL base dinámica
function getBaseUrl(req) {
    if (isProduction) {
        // En producción, usar el header host o la variable de entorno
        const host = req.get('host');
        return `https://${host}`;
    } else {
        // En desarrollo, usar localhost
        return `http://localhost:${PORT}`;
    }
}

// Configuración de seguridad para producción
if (isProduction) {
    app.set('trust proxy', 1);
    
    // Headers de seguridad
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
    });
    
    console.log('🔒 Configuración de seguridad de producción activada');
}

// Verificar configuración de Auth0
let auth0ConfigValid = process.env.AUTH0_SECRET && 
                       process.env.AUTH0_CLIENT_ID && 
                       process.env.AUTH0_CLIENT_SECRET &&
                       process.env.AUTH0_ISSUER_BASE_URL &&
                       process.env.AUTH0_SECRET !== 'tu-secret-largo-y-aleatorio-aqui-cambialo-por-seguridad' &&
                       process.env.AUTH0_CLIENT_ID !== 'tu-client-id-de-auth0';

// Configuración de Auth0 (según documentación oficial)
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email'
    }
};

// Middleware de Auth0 (solo si está configurado)
if (auth0ConfigValid) {
    try {
        app.use(auth(config));
        console.log('✅ Auth0 configurado correctamente');
    } catch (error) {
        console.error('❌ Error al configurar Auth0:', error.message);
        console.log('⚠️  Continuando en modo anónimo');
        auth0ConfigValid = false;
    }
} else {
    console.log('⚠️  Auth0 no configurado - funcionando en modo anónimo');
    console.log('   Para habilitar autenticación, configura las variables en .env');
}

// Middleware para manejar errores de Auth0
app.use((err, req, res, next) => {
    if (err.name === 'BadRequestError' && err.message.includes('state missing')) {
        console.error('Error de Auth0 - state missing:', err.message);
        // Redirigir al home en caso de error de Auth0
        return res.redirect('/');
    }
    next(err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting para prevenir abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana por IP
    message: { error: 'Demasiadas solicitudes. Por favor intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Agregar helmet para headers de seguridad (CSRF, X-Frame-Options, etc.)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            imgSrc: ["'self'", 'data:', 'via.placeholder.com'],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding
}));

// Configurar la base de datos SQLite
let dbPath = process.env.NODE_ENV === 'production' ? '/tmp/urls.db' : './urls.db';

// Validar que el path sea seguro solo en desarrollo local
if (process.env.NODE_ENV !== 'production') {
    const pathValidation = /^(\/tmp\/|\.\/)[a-zA-Z0-9_-]*\.db$/;
    if (dbPath && !pathValidation.test(dbPath)) {
        dbPath = './urls.db';
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // Migración robusta: verificar y agregar columna ip_address si no existe
        db.all("PRAGMA table_info(urls)", (err, columns) => {
            if (err) {
                console.error('❌ Error al verificar estructura de tabla:', err.message);
                return;
            }
            
            const columnNames = columns.map(col => col.name);
            
            if (!columnNames.includes('ip_address')) {
                // Crear tabla nueva con todas las columnas y copiar datos
                console.log('🔄 Migrando base de datos - agregando columna ip_address...');
                
                // Primero crear la nueva tabla
                db.run(`CREATE TABLE IF NOT EXISTS urls_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_url TEXT NOT NULL,
                    short_code TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    clicks INTEGER DEFAULT 0,
                    last_accessed DATETIME,
                    user_id TEXT DEFAULT NULL,
                    ip_address TEXT DEFAULT NULL
                )`, (err) => {
                    if (err) {
                        console.error('❌ Error al crear tabla temporal:', err.message);
                        return;
                    }
                    
                    // Copiar datos de la tabla original
                    db.run(`INSERT INTO urls_new (id, original_url, short_code, created_at, clicks, last_accessed, user_id, ip_address)
                            SELECT id, original_url, short_code, created_at, clicks, last_accessed, user_id, NULL FROM urls`, (err) => {
                        if (err) {
                            console.error('❌ Error al copiar datos:', err.message);
                            return;
                        }
                        
                        // Eliminar tabla original y renombrar la nueva
                        db.run('DROP TABLE urls', (err) => {
                            if (err) {
                                console.error('❌ Error al eliminar tabla original:', err.message);
                                return;
                            }
                            
                            db.run('ALTER TABLE urls_new RENAME TO urls', (err) => {
                                if (err) {
                                    console.error('❌ Error al renombrar tabla:', err.message);
                                    return;
                                }
                                
                                console.log('✅ Migración completada - columna ip_address agregada');
                            });
                        });
                    });
                });
            } else {
                console.log('✅ Tabla URLs verificada (ip_address ya existe)');
            }
        });
        
        // Crear la tabla si no existe (solo si es base de datos nueva)
        db.run(`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            short_code TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            clicks INTEGER DEFAULT 0,
            last_accessed DATETIME,
            user_id TEXT DEFAULT NULL,
            ip_address TEXT DEFAULT NULL
        )`, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla:', err.message);
            } else {
                console.log('✅ Tabla URLs verificada/creada');
            }
        });
    }
});

// Función para validar URL
function isValidURL(string) {
    try {
        return validator(string);
    } catch (err) {
        return false;
    }
}

// Función para validar shortCode (solo alphanumeric)
function isValidShortCode(string) {
    return /^[a-zA-Z0-9]+$/.test(string) && string.length <= 20;
}

// Rutas de fallback para Auth0 en caso de errores
app.get('/login', (req, res) => {
    if (!auth0ConfigValid) {
        return res.redirect('/?error=auth0_not_configured');
    }
    // Si Auth0 está configurado, el middleware lo manejará
    next();
});

app.get('/logout', (req, res) => {
    if (!auth0ConfigValid) {
        return res.redirect('/');
    }
    // Si Auth0 está configurado, el middleware lo manejará
    next();
});

app.get('/callback', (req, res) => {
    if (!auth0ConfigValid) {
        return res.redirect('/?error=auth0_not_configured');
    }
    // Si Auth0 está configurado, el middleware lo manejará
    next();
});

// Ruta para obtener información del usuario
app.get('/api/user', (req, res) => {
    if (!auth0ConfigValid) {
        return res.json({ 
            isAuthenticated: false,
            auth0Configured: false,
            message: 'Auth0 no configurado - funcionando en modo anónimo'
        });
    }
    
    if (req.oidc && req.oidc.isAuthenticated()) {
        console.log('Usuario autenticado:', req.oidc.user); // Debug
        res.json({ 
            isAuthenticated: true,
            auth0Configured: true,
            user: req.oidc.user 
        });
    } else {
        res.json({ 
            isAuthenticated: false,
            auth0Configured: true
        });
    }
});

// Ruta principal - servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de debug para verificar que el servidor funciona
app.get('/api/debug', (req, res) => {
    res.json({
        status: 'OK',
        environment: process.env.NODE_ENV || 'development',
        database: dbPath,
        timestamp: new Date().toISOString(),
        host: req.get('host')
    });
});

// API: Acortar URL
app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    const userId = (auth0ConfigValid && req.oidc && req.oidc.isAuthenticated()) ? req.oidc.user.sub : null;
    // IP del usuario para limitar-anónimos (con fallback seguro)
    const userIP = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    
    console.log('📝 [SHORTEN] Nueva solicitud de URL'); // Debug
    
    if (!url) {
        return res.status(400).json({ error: 'URL es requerida' });
    }
    
    // Validar longitud máxima de URL
    if (url.length > 10000) {
        return res.status(400).json({ error: 'URL excede el límite máximo de caracteres' });
    }
    
    if (!isValidURL(url)) {
        return res.status(400).json({ error: 'URL no válida' });
    }
    
    // Normalizar URL antes de guardar (sanitización adicional)
    let normalizedUrl = url.trim();
    try {
        const urlObj = new URL(normalizedUrl);
        // Forzar protocolos válidos y eliminar fragmentos
        normalizedUrl = urlObj.protocol + '//' + urlObj.hostname + urlObj.pathname + urlObj.search;
    } catch (e) {
        // Si falla, usar la original validada
    }
    
    // Solo verificar URLs existentes si el usuario está autenticado
    if (userId) {
        // Verificar si la URL ya existe para este usuario (usar normalizedUrl)
        const query = 'SELECT * FROM urls WHERE original_url = ? AND user_id = ?';
        const params = [normalizedUrl, userId];
        
        console.log('🔍 Verificando URL existente en DB'); // Debug
        
        db.get(query, params, (err, row) => {
            if (err) {
                console.error('❌ Error en db.get:', err); // Debug
                return res.status(500).json({ error: 'Error de base de datos: ' + err.message });
            }
            
            console.log('✅ URL ya existe'); // Debug
            
            if (row) {
                // URL ya existe, devolver el código existente
                return res.json({
                    success: true,
                    shortUrl: `${getBaseUrl(req)}/${row.short_code}`,
                    shortCode: row.short_code,
                    originalUrl: row.original_url
                });
            }
            
            // Crear nuevo código corto
            const shortCode = generateShortCode();
            
            console.log('💾 Insertando nueva URL'); // Debug
            
            db.run('INSERT INTO urls (original_url, short_code, user_id) VALUES (?, ?, ?)', 
                [normalizedUrl, shortCode, userId], function(err) {
                if (err) {
                    console.error('❌ Error en db.run:', err); // Debug
                    return res.status(500).json({ error: 'Error al guardar URL: ' + err.message });
                }
                
                console.log('✅ URL guardada exitosamente'); // Debug
                
                res.json({
                    success: true,
                    shortUrl: `${getBaseUrl(req)}/${shortCode}`,
                    shortCode: shortCode,
                    originalUrl: normalizedUrl
                });
            });
        });
    } else {
        // Usuario no autenticado - solo puede tener 1 URL temporal activa a la vez
        // Eliminar cualquier URL temporal anterior de esta IP (lógica "uno a la vez")
        db.run('DELETE FROM urls WHERE user_id IS NULL AND ip_address = ?', 
            [userIP], (err) => {
            if (err) {
                console.error('❌ Error al eliminar URL temporal anterior:', err);
            } else {
                console.log('🗑️ URL temporal anterior eliminada (si existía)');
            }
            
            // Generar código corto para URL temporal
            let shortCode;
            try {
                shortCode = generateShortCode();
            } catch (e) {
                // Fallback si generateShortCode falla
                const shortid = require('shortid');
                shortCode = shortid.generate();
            }
            
            console.log('🔄 Generando URL temporal');
            
            // Guardar URL temporal en la base de datos (sin user_id, pero con IP) - usar normalizedUrl
            db.run('INSERT INTO urls (original_url, short_code, user_id, ip_address) VALUES (?, ?, NULL, ?)', 
                [normalizedUrl, shortCode, userIP], function(err) {
                if (err) {
                    console.error('❌ Error al guardar URL temporal:', err);
                    return res.status(500).json({ error: 'Error al guardar URL temporal: ' + err.message });
                }
                
                console.log('✅ URL temporal guardada exitosamente');
                
                res.json({
                    success: true,
                    shortUrl: `${getBaseUrl(req)}/${shortCode}`,
                    shortCode: shortCode,
                    originalUrl: normalizedUrl,
                    temporary: true,
                    message: 'URL temporal creada. Inicia sesión para guardarla y acceder a más beneficios.'
                });
            });
        });
    }
});

// API: Obtener estadísticas
app.get('/api/stats/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    // Validar shortCode para prevenir SQL injection
    if (!isValidShortCode(shortCode)) {
        return res.status(400).json({ error: 'Código corto inválido' });
    }
    
    db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'URL no encontrada' });
        }
        
        res.json({
            originalUrl: row.original_url,
            shortCode: row.short_code,
            clicks: row.clicks,
            createdAt: row.created_at,
            lastAccessed: row.last_accessed
        });
    });
});

// API: Listar URLs del usuario (solo si está autenticado)
app.get('/api/urls', (req, res) => {
    const userId = (auth0ConfigValid && req.oidc && req.oidc.isAuthenticated()) ? req.oidc.user.sub : null;
    
    console.log('📋 Solicitando lista de URLs'); // Debug
    
    // Solo devolver URLs si el usuario está autenticado
    if (!userId) {
        return res.json({ 
            urls: [], 
            requiresAuth: true,
            message: 'Inicia sesión para ver tu historial de URLs'
        });
    }
    
    const query = 'SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC';
    const params = [userId];
    
    console.log('🔍 Ejecutando query de URLs'); // Debug
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('❌ Error en db.all:', err); // Debug
            return res.status(500).json({ error: 'Error de base de datos: ' + err.message });
        }
        
        console.log('✅ URLs encontradas:', rows.length); // Debug
        
        res.json({ urls: rows });
    });
});

// API: Eliminar URL
app.delete('/api/urls/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const userId = (auth0ConfigValid && req.oidc && req.oidc.isAuthenticated()) ? req.oidc.user.sub : null;
    
    // Validar shortCode para prevenir SQL injection
    if (!isValidShortCode(shortCode)) {
        return res.status(400).json({ error: 'Código corto inválido' });
    }
    
    if (!shortCode) {
        return res.status(400).json({ error: 'Código corto es requerido' });
    }
    
    // Verificar si la URL existe y pertenece al usuario
    const query = userId ? 
        'SELECT * FROM urls WHERE short_code = ? AND user_id = ?' :
        'SELECT * FROM urls WHERE short_code = ? AND user_id IS NULL';
    const params = userId ? [shortCode, userId] : [shortCode];
    
    db.get(query, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'URL no encontrada o no autorizada' });
        }
        
        // Eliminar la URL
        const deleteQuery = userId ? 
            'DELETE FROM urls WHERE short_code = ? AND user_id = ?' :
            'DELETE FROM urls WHERE short_code = ? AND user_id IS NULL';
        
        db.run(deleteQuery, params, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar URL' });
            }
            
            res.json({
                success: true,
                message: 'URL eliminada exitosamente',
                deletedShortCode: shortCode
            });
        });
    });
});

// API: Generar código QR para una URL corta
app.get('/api/qr/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    
    console.log('🎯 QR request para shortCode:', shortCode);
    
    // Validar shortCode para prevenir SQL injection
    if (!isValidShortCode(shortCode)) {
        return res.status(400).json({ error: 'Código corto inválido' });
    }
    
    if (!shortCode) {
        return res.status(400).json({ error: 'Código corto es requerido' });
    }
    
    try {
        // Generar la URL corta
        const shortUrl = `${getBaseUrl(req)}/${shortCode}`;
        
        // Generar código QR como Data URL (base64)
        const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#667eea',
                light: '#FFFFFF'
            }
        });
        
        console.log('✅ QR generado exitosamente para:', shortUrl);
        
        res.json({
            success: true,
            shortCode: shortCode,
            shortUrl: shortUrl,
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        console.error('❌ Error al generar QR:', error);
        res.status(500).json({ error: 'Error al generar código QR' });
    }
});

// Redirección: Cuando alguien accede a la URL corta
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    // Validar shortCode para prevenir SQL injection y ataques
    if (!isValidShortCode(shortCode)) {
        return res.status(404).send('URL no encontrada');
    }
    
    db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
        if (err) {
            return res.status(500).send('Error del servidor');
        }
        
        if (!row) {
            return res.status(404).send('URL no encontrada');
        }
        
        // Prevenir open redirect - solo permitir http y https
        const originalUrl = row.original_url;
        try {
            const urlObj = new URL(originalUrl);
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                console.error('⚠️ Intento de open redirect bloqueado:', originalUrl);
                return res.status(400).send('URL no válida');
            }
        } catch (e) {
            return res.status(400).send('URL no válida');
        }
        
        // Incrementar contador de clicks y actualizar última fecha de acceso
        db.run('UPDATE urls SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP WHERE short_code = ?', 
            [shortCode], (err) => {
            if (err) {
                console.error('Error al actualizar estadísticas:', err);
            }
        });
        
        // Redirigir a la URL original
        res.redirect(originalUrl);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Acortador de URL ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: SQLite local (urls.db)`);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('Base de datos cerrada.');
        }
        process.exit(0);
    });
});
