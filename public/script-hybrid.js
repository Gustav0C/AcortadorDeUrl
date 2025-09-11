// Variables globales (mantenemos la estructura original)
let currentUrls = [];
let currentQRData = null;
let historyVisible = false;
let currentUser = null;

// Simular estado de usuario (para GitHub Pages)
const mockUser = {
    name: 'Usuario Demo',
    email: 'demo@example.com',
    picture: 'https://via.placeholder.com/32x32/667eea/ffffff?text=U'
};

// Función para cargar información del usuario (adaptada para GitHub Pages)
async function loadUserInfo() {
    try {
        // En GitHub Pages, simular usuario logueado
        const isLoggedIn = localStorage.getItem('demo_logged_in') === 'true';
        
        if (isLoggedIn) {
            currentUser = mockUser;
            updateAuthUI(true, true);
        } else {
            currentUser = null;
            updateAuthUI(false, true);
        }
        
        // Cargar URLs después de verificar autenticación
        loadUrls();
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        updateAuthUI(false, false);
    }
}

// Función para actualizar la UI de autenticación (mantenemos la original)
function updateAuthUI(isAuthenticated, auth0Configured = true) {
    const authSection = document.getElementById('authSection');
    const loginPromotion = document.getElementById('loginPromotion');
    const historyToggle = document.querySelector('.history-toggle');
    
    if (!auth0Configured) {
        authSection.innerHTML = `
            <div class="auth-info">
                <i class="fas fa-info-circle"></i>
                <span>Modo anónimo - Auth0 no configurado</span>
            </div>
        `;
        // Ocultar promoción y historial si Auth0 no está configurado
        if (loginPromotion) loginPromotion.classList.add('hidden');
        if (historyToggle) historyToggle.classList.add('hidden');
        return;
    }
    
    if (isAuthenticated && currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <img src="${currentUser.picture || 'https://via.placeholder.com/32x32/667eea/ffffff?text=' + (currentUser.name ? currentUser.name.charAt(0) : 'U')}" 
                     alt="Avatar de ${currentUser.name || 'Usuario'}" 
                     class="user-avatar"
                     onerror="this.src='https://via.placeholder.com/32x32/667eea/ffffff?text=${currentUser.name ? currentUser.name.charAt(0) : 'U'}'">
                <span class="user-name">${currentUser.name || currentUser.email || 'Usuario'}</span>
            </div>
            <button onclick="logout()" class="auth-btn">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
        `;
        // Usuario autenticado: ocultar promoción, mostrar historial
        if (loginPromotion) loginPromotion.classList.add('hidden');
        if (historyToggle) historyToggle.classList.remove('hidden');
    } else {
        // Usuario no autenticado: no mostrar botón en header
        authSection.innerHTML = '';
        // Usuario no autenticado: mostrar promoción, ocultar historial
        if (loginPromotion) loginPromotion.classList.remove('hidden');
        if (historyToggle) historyToggle.classList.add('hidden');
    }
}

// Función de login simulado (para GitHub Pages)
function simulateLogin() {
    localStorage.setItem('demo_logged_in', 'true');
    loadUserInfo();
    showNotification('¡Login exitoso! (Modo demo)', 'success');
}

// Función de logout simulado
function logout() {
    localStorage.removeItem('demo_logged_in');
    currentUser = null;
    loadUserInfo();
    showNotification('Sesión cerrada', 'success');
}

// Inicializar cuando se carga la página (mantenemos la estructura original)
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay errores de Auth0 en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'auth0_not_configured') {
        showNotification('Auth0 no está configurado correctamente', 'error');
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    loadUserInfo();
});

// Función para mostrar notificaciones (mantenemos la original)
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Función para acortar URL (adaptada para GitHub Pages)
async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Por favor, ingresa una URL', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showNotification('Por favor, ingresa una URL válida', 'error');
        return;
    }
    
    try {
        // Simular acortamiento de URL
        const shortId = generateShortId();
        const shortUrl = `${window.location.origin}/${shortId}`;
        
        const urlData = {
            id: shortId,
            originalUrl: url,
            shortUrl: shortUrl,
            createdAt: new Date().toISOString(),
            userId: currentUser ? currentUser.email : null
        };
        
        // Guardar en localStorage si hay usuario
        if (currentUser) {
            saveUrlToHistory(urlData);
        }
        
        // Mostrar resultado
        displayResult(urlData);
        
        showNotification('¡URL acortada con éxito!', 'success');
        
        // Limpiar input
        urlInput.value = '';
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        showNotification('Error al acortar la URL', 'error');
    }
}

// Función para generar ID corto
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Función para validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Función para guardar URL en el historial
function saveUrlToHistory(urlData) {
    let history = JSON.parse(localStorage.getItem('url_history') || '[]');
    history.unshift(urlData);
    // Mantener solo las últimas 50 URLs
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    localStorage.setItem('url_history', JSON.stringify(history));
}

// Función para mostrar resultado (mantenemos la original)
function displayResult(data) {
    const resultSection = document.getElementById('resultSection');
    const shortUrl = document.getElementById('shortUrl');
    const originalUrl = document.getElementById('originalUrl');
    const copyBtn = document.getElementById('copyBtn');
    const qrBtn = document.getElementById('qrBtn');
    const createAnotherBtn = document.getElementById('createAnotherBtn');
    
    shortUrl.textContent = data.shortUrl;
    originalUrl.textContent = data.originalUrl;
    
    // Configurar botones
    copyBtn.onclick = () => copyToClipboard(data.shortUrl);
    qrBtn.onclick = () => {
        currentQRData = { url: data.shortUrl, originalUrl: data.originalUrl };
        generateQR();
    };
    createAnotherBtn.onclick = createAnother;
    
    // Mostrar sección con animación
    resultSection.classList.remove('hidden');
    resultSection.style.animation = 'slideInUp 0.5s ease-out forwards';
}

// Función para copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('¡URL copiada al portapapeles!', 'success');
    } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('¡URL copiada al portapapeles!', 'success');
    }
}

// Función para generar código QR (mantenemos la original)
async function generateQR() {
    const qrSection = document.getElementById('qrSection');
    const qrImage = document.getElementById('qrImage');
    
    if (!currentQRData) {
        // Si no hay datos, usar la URL del resultado actual
        const shortUrl = document.getElementById('shortUrl').textContent;
        if (!shortUrl) return;
        
        currentQRData = {
            url: shortUrl,
            originalUrl: shortUrl
        };
    }
    
    try {
        // Generar QR como data URL usando la misma configuración del original
        const qrDataURL = await QRCode.toDataURL(currentQRData.url, {
            width: 200,
            height: 200,
            color: {
                dark: '#667eea',
                light: '#ffffff'
            },
            margin: 2
        });
        
        qrImage.src = qrDataURL;
        qrSection.classList.remove('hidden');
        qrSection.style.animation = 'fadeIn 0.5s ease-out forwards';
        
        showNotification('¡Código QR generado!', 'success');
    } catch (error) {
        console.error('Error generating QR:', error);
        showNotification('Error al generar código QR', 'error');
    }
}

// Función crear otro (mantenemos la original)
function createAnother() {
    const resultSection = document.getElementById('resultSection');
    const qrSection = document.getElementById('qrSection');
    const urlInput = document.getElementById('urlInput');
    
    // Ocultar secciones
    resultSection.classList.add('hidden');
    qrSection.classList.add('hidden');
    
    // Limpiar datos
    currentQRData = null;
    
    // Enfocar input
    urlInput.focus();
    
    // Actualizar historial si está visible
    if (historyVisible) {
        loadUrls();
    }
}

// Función para cargar URLs (adaptada para GitHub Pages)
async function loadUrls() {
    try {
        if (!currentUser) {
            // Usuario no logueado: no mostrar historial
            return;
        }
        
        // Cargar desde localStorage
        const history = JSON.parse(localStorage.getItem('url_history') || '[]');
        currentUrls = history;
        
        if (historyVisible) {
            displayUrls();
        }
    } catch (error) {
        console.error('Error loading URLs:', error);
        showNotification('Error al cargar el historial', 'error');
    }
}

// Función para mostrar/ocultar historial
function toggleHistory() {
    if (!currentUser) {
        showNotification('Debes iniciar sesión para ver el historial', 'error');
        return;
    }
    
    historyVisible = !historyVisible;
    const historySection = document.getElementById('historySection');
    const toggleBtn = document.querySelector('.history-toggle');
    
    if (historyVisible) {
        loadUrls();
        historySection.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Historial';
    } else {
        historySection.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-history"></i> Ver Historial';
    }
}

// Función para mostrar URLs en el historial
function displayUrls() {
    const urlsList = document.getElementById('urlsList');
    
    if (!currentUrls || currentUrls.length === 0) {
        urlsList.innerHTML = '<p class="no-urls">No hay URLs acortadas aún</p>';
        return;
    }
    
    urlsList.innerHTML = currentUrls.map(url => `
        <div class="url-item">
            <div class="url-info">
                <div class="url-short">
                    <a href="${url.originalUrl}" target="_blank">${url.shortUrl}</a>
                    <button onclick="copyToClipboard('${url.shortUrl}')" class="copy-btn-small">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="url-original">${url.originalUrl}</div>
                <div class="url-date">${formatDate(url.createdAt)}</div>
            </div>
            <div class="url-actions">
                <button onclick="generateQRForUrl('${url.shortUrl}', '${url.originalUrl}')" class="qr-btn-small">
                    <i class="fas fa-qrcode"></i>
                </button>
                <button onclick="deleteUrl('${url.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Función para generar QR para una URL específica
function generateQRForUrl(shortUrl, originalUrl) {
    currentQRData = { url: shortUrl, originalUrl: originalUrl };
    generateQR();
}

// Función para eliminar URL
function deleteUrl(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta URL?')) {
        return;
    }
    
    try {
        let history = JSON.parse(localStorage.getItem('url_history') || '[]');
        history = history.filter(url => url.id !== id);
        localStorage.setItem('url_history', JSON.stringify(history));
        
        currentUrls = history;
        displayUrls();
        showNotification('URL eliminada', 'success');
    } catch (error) {
        console.error('Error deleting URL:', error);
        showNotification('Error al eliminar la URL', 'error');
    }
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Event listeners para el formulario
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('urlForm');
    const urlInput = document.getElementById('urlInput');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            shortenUrl();
        });
    }
    
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                shortenUrl();
            }
        });
    }
    
    // Actualizar botón de login en la promoción
    const loginBtn = document.querySelector('#loginPromotion .cta-button');
    if (loginBtn) {
        loginBtn.onclick = simulateLogin;
        loginBtn.href = '#';
    }
});
