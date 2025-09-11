require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const shortid = require('shortid');
const cors = require('cors');
const path = require('path');
const validator = require('url-validator');
const QRCode = require('qrcode');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

// Configurar la base de datos SQLite
const db = new sqlite3.Database('./urls.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Crear la tabla si no existe
        db.run(`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            short_code TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            clicks INTEGER DEFAULT 0,
            last_accessed DATETIME,
            user_id TEXT DEFAULT NULL
        )`, (err) => {
            if (err) {
                console.error('❌ Error al crear tabla:', err.message);
            } else {
                console.log('✅ Tabla URLs verificada/creada exitosamente');
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

// API: Acortar URL
app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    const userId = (auth0ConfigValid && req.oidc && req.oidc.isAuthenticated()) ? req.oidc.user.sub : null;
    
    console.log('📝 Acortar URL request:', { url, userId, auth0ConfigValid }); // Debug
    
    if (!url) {
        return res.status(400).json({ error: 'URL es requerida' });
    }
    
    if (!isValidURL(url)) {
        return res.status(400).json({ error: 'URL no válida' });
    }
    
    // Solo verificar URLs existentes si el usuario está autenticado
    if (userId) {
        // Verificar si la URL ya existe para este usuario
        const query = 'SELECT * FROM urls WHERE original_url = ? AND user_id = ?';
        const params = [url, userId];
        
        console.log('🔍 Query:', query, 'Params:', params); // Debug
        
        db.get(query, params, (err, row) => {
            if (err) {
                console.error('❌ Error en db.get:', err); // Debug
                return res.status(500).json({ error: 'Error de base de datos: ' + err.message });
            }
            
            console.log('✅ Resultado db.get:', row); // Debug
            
            if (row) {
                // URL ya existe, devolver el código existente
                return res.json({
                    success: true,
                    shortUrl: `http://localhost:${PORT}/${row.short_code}`,
                    shortCode: row.short_code,
                    originalUrl: row.original_url
                });
            }
            
            // Crear nuevo código corto
            const shortCode = shortid.generate();
            
            console.log('💾 Insertando nueva URL:', { url, shortCode, userId }); // Debug
            
            db.run('INSERT INTO urls (original_url, short_code, user_id) VALUES (?, ?, ?)', 
                [url, shortCode, userId], function(err) {
                if (err) {
                    console.error('❌ Error en db.run:', err); // Debug
                    return res.status(500).json({ error: 'Error al guardar URL: ' + err.message });
                }
                
                console.log('✅ URL guardada exitosamente'); // Debug
                
                res.json({
                    success: true,
                    shortUrl: `http://localhost:${PORT}/${shortCode}`,
                    shortCode: shortCode,
                    originalUrl: url
                });
            });
        });
    } else {
        // Usuario no autenticado - solo generar código sin guardar
        const shortCode = shortid.generate();
        
        console.log('🔄 Generando URL temporal para usuario no autenticado:', { url, shortCode }); // Debug
        
        res.json({
            success: true,
            shortUrl: `http://localhost:${PORT}/${shortCode}`,
            shortCode: shortCode,
            originalUrl: url,
            temporary: true // Indicar que es temporal
        });
    }
});

// API: Obtener estadísticas
app.get('/api/stats/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
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
    
    console.log('📋 Listar URLs request:', { userId, auth0ConfigValid }); // Debug
    
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
    
    console.log('🔍 Query URLs:', query, 'Params:', params); // Debug
    
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
    
    if (!shortCode) {
        return res.status(400).json({ error: 'Código corto es requerido' });
    }
    
    // Verificar si la URL existe
    db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'URL no encontrada' });
        }
        
        try {
            const shortUrl = `http://localhost:${PORT}/${shortCode}`;
            
            // Generar código QR como Data URL (base64)
            const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            res.json({
                success: true,
                shortCode: shortCode,
                shortUrl: shortUrl,
                originalUrl: row.original_url,
                qrCode: qrCodeDataUrl
            });
        } catch (qrError) {
            console.error('Error al generar código QR:', qrError);
            res.status(500).json({ error: 'Error al generar código QR' });
        }
    });
});

// Redirección: Cuando alguien accede a la URL corta
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode], (err, row) => {
        if (err) {
            return res.status(500).send('Error del servidor');
        }
        
        if (!row) {
            return res.status(404).send('URL no encontrada');
        }
        
        // Incrementar contador de clicks y actualizar última fecha de acceso
        db.run('UPDATE urls SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP WHERE short_code = ?', 
            [shortCode], (err) => {
            if (err) {
                console.error('Error al actualizar estadísticas:', err);
            }
        });
        
        // Redirigir a la URL original
        res.redirect(row.original_url);
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
