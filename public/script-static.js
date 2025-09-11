// Variables globales para versión GitHub Pages
let currentUrls = [];
let currentQRData = null;
let historyVisible = false;
let currentUser = null; // Siempre null para versión estática
const STORAGE_KEY = 'fisurl_local_storage';

// Función para generar ID corto
function generateShortId() {
    return Math.random().toString(36).substring(2, 8);
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

// Emular funciones del servidor
function updateAuthUI(isAuthenticated = false, auth0Configured = false) {
    const authSection = document.getElementById('authSection');
    // Para versión GitHub Pages, siempre mostrar como no autenticado
    authSection.innerHTML = '';
}

// Cargar URLs del localStorage
function loadUrls() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        currentUrls = stored ? JSON.parse(stored) : [];
        renderUrls();
    } catch (error) {
        console.error('Error loading URLs from localStorage:', error);
        currentUrls = [];
    }
}

// Guardar URLs en localStorage
function saveUrls() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUrls));
    } catch (error) {
        console.error('Error saving URLs to localStorage:', error);
        showNotification('Error al guardar en almacenamiento local', 'error');
    }
}

// Función para acortar URL (versión estática)
async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Por favor ingresa una URL', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showNotification('Por favor ingresa una URL válida', 'error');
        return;
    }
    
    // Mostrar estado de carga
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generar URL corta (simulada para GitHub Pages)
        const shortCode = generateShortId();
        const shortUrl = `${window.location.origin}${window.location.pathname}#${shortCode}`;
        
        // Crear objeto URL
        const urlData = {
            id: Date.now(),
            originalUrl: url,
            shortCode: shortCode,
            shortUrl: shortUrl,
            clicks: 0,
            createdAt: new Date().toISOString(),
            lastAccessed: null
        };
        
        // Guardar en localStorage
        currentUrls.unshift(urlData);
        saveUrls();
        
        // Ocultar sección de input
        inputSection.style.animation = 'fadeOut 0.5s ease-out forwards';
        
        setTimeout(() => {
            inputSection.classList.add('hidden');
            
            // Mostrar resultado
            document.getElementById('shortUrl').textContent = shortUrl;
            document.getElementById('createdDate').textContent = new Date().toLocaleDateString();
            resultSection.classList.remove('hidden');
            resultSection.style.animation = 'fadeIn 0.5s ease-out forwards';
            
            // Guardar datos para QR
            currentQRData = {
                url: shortUrl,
                originalUrl: url
            };
            
            showNotification('¡URL acortada exitosamente!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Error shortening URL:', error);
        showNotification('Error al acortar la URL', 'error');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fas fa-compress-alt"></i>';
    }
}

// Función para copiar al portapapeles
async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl').textContent;
    
    try {
        await navigator.clipboard.writeText(shortUrl);
        showNotification('¡URL copiada al portapapeles!', 'success');
    } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('¡URL copiada al portapapeles!', 'success');
    }
}

// Función para generar código QR
async function generateQR() {
    const qrSection = document.getElementById('qrSection');
    const qrImage = document.getElementById('qrImage');
    
    if (!currentQRData) return;
    
    try {
        // Generar QR como data URL
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

// Función para descargar QR
function downloadQR() {
    const qrImage = document.getElementById('qrImage');
    if (!qrImage.src) return;
    
    const link = document.createElement('a');
    link.download = `qr-${currentQRData.originalUrl.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = qrImage.src;
    link.click();
    
    showNotification('¡Código QR descargado!', 'success');
}

// Función para crear otra URL (equivalente a resetForm)
function createAnother() {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    const qrSection = document.getElementById('qrSection');
    const urlInput = document.getElementById('urlInput');
    
    // Ocultar resultado
    resultSection.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        resultSection.classList.add('hidden');
        qrSection.classList.add('hidden');
        
        // Mostrar input
        inputSection.classList.remove('hidden');
        inputSection.style.animation = 'fadeIn 0.5s ease-out forwards';
        
        // Limpiar input
        urlInput.value = '';
        urlInput.focus();
        
        // Limpiar datos QR
        currentQRData = null;
    }, 500);
}

// Función para mostrar/ocultar historial
function toggleHistory() {
    const historySection = document.getElementById('historySection');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    historyVisible = !historyVisible;
    
    if (historyVisible) {
        historySection.classList.remove('hidden');
        historySection.style.animation = 'slideDown 0.5s ease-out forwards';
        toggleBtn.innerHTML = '<i class="fas fa-history"></i> Ocultar historial';
        loadUrls(); // Recargar URLs
    } else {
        historySection.style.animation = 'slideUp 0.5s ease-out forwards';
        setTimeout(() => {
            historySection.classList.add('hidden');
        }, 500);
        toggleBtn.innerHTML = '<i class="fas fa-history"></i> Ver historial local';
    }
}

// Función para renderizar URLs
function renderUrls() {
    const urlsList = document.getElementById('urlsList');
    
    if (currentUrls.length === 0) {
        urlsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No hay URLs guardadas localmente</p>
                <small>Las URLs se guardan en tu navegador</small>
            </div>
        `;
        return;
    }
    
    urlsList.innerHTML = currentUrls.map(url => `
        <div class="url-item" data-id="${url.id}">
            <div class="url-content">
                <div class="url-info">
                    <div class="url-main">
                        <span class="short-url">${url.shortUrl}</span>
                        <button onclick="copyUrl('${url.shortUrl}')" class="copy-url-btn" title="Copiar">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="original-url">${url.originalUrl}</div>
                    <div class="url-stats">
                        <span><i class="fas fa-calendar"></i> ${new Date(url.createdAt).toLocaleDateString()}</span>
                        <span><i class="fas fa-mouse-pointer"></i> ${url.clicks} clics</span>
                    </div>
                </div>
                <div class="url-actions">
                    <button onclick="generateUrlQR('${url.shortUrl}')" class="action-btn qr-btn" title="Generar QR">
                        <i class="fas fa-qrcode"></i>
                    </button>
                    <button onclick="deleteUrl(${url.id})" class="action-btn delete-btn" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para copiar URL del historial
async function copyUrl(url) {
    try {
        await navigator.clipboard.writeText(url);
        showNotification('¡URL copiada!', 'success');
    } catch (error) {
        console.error('Error copying URL:', error);
        showNotification('Error al copiar URL', 'error');
    }
}

// Función para generar QR de URL del historial
async function generateUrlQR(url) {
    try {
        // Crear modal para mostrar QR
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-modal-content">
                <div class="qr-modal-header">
                    <h3>Código QR</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="qr-modal-body">
                    <div id="modalQR"></div>
                    <p class="qr-url">${url}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Generar QR en el modal
        await QRCode.toCanvas(modal.querySelector('#modalQR'), url, {
            width: 200,
            height: 200,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            margin: 2
        });
        
        showNotification('¡Código QR generado!', 'success');
    } catch (error) {
        console.error('Error generating QR:', error);
        showNotification('Error al generar código QR', 'error');
    }
}

// Función para eliminar URL
function deleteUrl(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta URL?')) return;
    
    currentUrls = currentUrls.filter(url => url.id !== id);
    saveUrls();
    renderUrls();
    showNotification('URL eliminada', 'success');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Configurar UI como no autenticado
    updateAuthUI(false, false);
    
    // Cargar URLs del localStorage
    loadUrls();
    
    // Manejar Enter en el input
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });
    
    // Focus en el input
    document.getElementById('urlInput').focus();
    
    // Manejar redirecciones basadas en hash (si alguien comparte una URL corta)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const urlData = currentUrls.find(url => url.shortCode === hash);
        
        if (urlData) {
            // Incrementar contador de clics
            urlData.clicks++;
            urlData.lastAccessed = new Date().toISOString();
            saveUrls();
            
            // Redirigir a la URL original
            showNotification('Redirigiendo...', 'info');
            setTimeout(() => {
                window.open(urlData.originalUrl, '_blank');
            }, 1000);
        } else {
            showNotification('URL no encontrada en el historial local', 'warning');
        }
    }
});
