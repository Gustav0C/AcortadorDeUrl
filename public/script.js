// Variables globales
let currentUrls = [];
let currentQRData = null;
let historyVisible = false;
let currentUser = null;

// Función para cargar información del usuario
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        console.log('User data received:', data); // Debug
        
        if (data.isAuthenticated) {
            currentUser = data.user;
            console.log('Current user:', currentUser); // Debug
            updateAuthUI(true, data.auth0Configured);
        } else {
            currentUser = null;
            updateAuthUI(false, data.auth0Configured);
        }
        
        // Cargar URLs después de verificar autenticación
        loadUrls();
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        updateAuthUI(false, false);
    }
}

// Función para actualizar la UI de autenticación
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
            <a href="/logout" class="auth-btn">
                <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </a>
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

// Inicializar cuando se carga la página
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

// Función para mostrar notificaciones
// Variable para evitar notificaciones duplicadas
let currentNotificationTimeout = null;

function showNotification(message, type = 'success') {
    console.log('📢 Showing notification:', message, 'Type:', type); // Debug
    const notification = document.getElementById('notification');
    
    // Cancelar el timeout anterior si existe
    if (currentNotificationTimeout) {
        clearTimeout(currentNotificationTimeout);
        currentNotificationTimeout = null;
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    currentNotificationTimeout = setTimeout(() => {
        console.log('⏰ Hiding notification after 3s:', message); // Debug
        notification.classList.remove('show');
        currentNotificationTimeout = null;
    }, 3000);
}

// Función para acortar URL
async function shortenUrl() {
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    // Evitar doble ejecución
    if (shortenBtn.disabled) {
        console.log('🚫 shortenUrl ya en ejecución, ignorando'); // Debug
        return;
    }
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Por favor ingresa una URL', 'error');
        return;
    }
    
    // Validación básica de URL
    if (!isValidUrl(url)) {
        showNotification('Por favor ingresa una URL válida', 'error');
        return;
    }
    
    // Mostrar estado de carga
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Ocultar sección de input con animación
            inputSection.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                inputSection.classList.add('hidden');
                
                // Mostrar resultado
                document.getElementById('shortUrl').textContent = data.shortUrl;
                resultSection.classList.remove('hidden');
                
                // Ocultar QR si estaba visible
                const qrSection = document.getElementById('qrSection');
                qrSection.classList.add('hidden');
                currentQRData = null;
                
                // Mostrar mensaje diferente según si es temporal o no
                if (data.temporary) {
                    showNotification('¡URL acortada! (Temporal - Inicia sesión para guardarla)', 'warning');
                } else {
                    showNotification('¡URL acortada y guardada exitosamente!');
                }
                
                // Solo actualizar historial si el usuario está autenticado
                if (currentUser) {
                    loadUrls();
                }
            }, 500);
        } else {
            showNotification(data.error || 'Error al acortar URL', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    } finally {
        // Restaurar botón
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fas fa-compress-alt"></i>';
    }
}

// Función para validar URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Función para copiar al portapapeles
async function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl').textContent;
    
    try {
        await navigator.clipboard.writeText(shortUrl);
        showNotification('¡URL copiada al portapapeles!');
    } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('¡URL copiada al portapapeles!');
    }
}

// Función para generar código QR
async function generateQR() {
    const shortUrl = document.getElementById('shortUrl').textContent;
    const qrSection = document.getElementById('qrSection');
    const qrImage = document.getElementById('qrImage');
    
    if (!shortUrl) {
        showNotification('No hay URL para generar QR', 'error');
        return;
    }
    
    // Extraer el código corto de la URL
    const shortCode = shortUrl.split('/').pop();
    
    try {
        const response = await fetch(`/api/qr/${shortCode}`);
        const data = await response.json();
        
        if (data.success) {
            // Mostrar el código QR con animación
            qrImage.src = data.qrCode;
            currentQRData = data.qrCode;
            qrSection.classList.remove('hidden');
            
            showNotification('¡Código QR generado!');
        } else {
            showNotification(data.error || 'Error al generar código QR', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// Función para descargar código QR
function downloadQR() {
    if (!currentQRData) {
        showNotification('No hay código QR para descargar', 'error');
        return;
    }
    
    const shortUrl = document.getElementById('shortUrl').textContent;
    const shortCode = shortUrl.split('/').pop();
    
    // Crear elemento de descarga
    const link = document.createElement('a');
    link.download = `qr-code-${shortCode}.png`;
    link.href = currentQRData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('¡Código QR descargado!');
}

// Función para crear otra URL
function createAnother() {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    const urlInput = document.getElementById('urlInput');
    
    // Ocultar resultado
    resultSection.classList.add('hidden');
    
    // Mostrar input
    inputSection.classList.remove('hidden');
    inputSection.style.animation = 'fadeInUp 0.5s ease-out forwards';
    
    // Limpiar input y enfocar
    urlInput.value = '';
    urlInput.focus();
    
    // Ocultar QR
    const qrSection = document.getElementById('qrSection');
    qrSection.classList.add('hidden');
    currentQRData = null;
}

// Función para alternar historial
function toggleHistory() {
    const historySection = document.getElementById('historySection');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    historyVisible = !historyVisible;
    
    if (historyVisible) {
        historySection.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar historial';
        loadUrls();
    } else {
        historySection.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-history"></i> Ver historial';
    }
}

// Función para eliminar URL
async function deleteUrl(shortCode) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta URL? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/urls/${shortCode}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('¡URL eliminada exitosamente!');
            loadUrls();
        } else {
            showNotification(data.error || 'Error al eliminar URL', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// Función para mostrar QR desde historial
async function showQRFromHistory(shortCode) {
    try {
        const response = await fetch(`/api/qr/${shortCode}`);
        const data = await response.json();
        
        if (data.success) {
            // Crear modal para mostrar el QR
            const modal = document.createElement('div');
            modal.className = 'qr-modal';
            modal.innerHTML = `
                <div class="qr-modal-content">
                    <div class="qr-modal-header">
                        <h3><i class="fas fa-qrcode"></i> Código QR</h3>
                        <button onclick="closeQRModal()" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="qr-modal-body">
                        <img src="${data.qrCode}" alt="Código QR" class="qr-modal-image" />
                        <p class="qr-url">${data.shortUrl}</p>
                        <div class="qr-modal-actions">
                            <button onclick="downloadQRFromModal('${data.qrCode}', '${shortCode}')" class="download-btn">
                                <i class="fas fa-download"></i> Descargar
                            </button>
                            <button onclick="copyToClipboardFromModal('${data.shortUrl}')" class="copy-btn">
                                <i class="fas fa-copy"></i> Copiar URL
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Cerrar modal al hacer click fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeQRModal();
                }
            });
            
        } else {
            showNotification(data.error || 'Error al generar código QR', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión', 'error');
    }
}

// Función para cerrar modal QR
function closeQRModal() {
    const modal = document.querySelector('.qr-modal');
    if (modal) {
        modal.remove();
    }
}

// Función para descargar QR desde modal
function downloadQRFromModal(qrData, shortCode) {
    const link = document.createElement('a');
    link.download = `qr-code-${shortCode}.png`;
    link.href = qrData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('¡Código QR descargado!');
}

// Función para copiar URL desde modal
async function copyToClipboardFromModal(url) {
    try {
        await navigator.clipboard.writeText(url);
        showNotification('¡URL copiada al portapapeles!');
    } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('¡URL copiada al portapapeles!');
    }
}

// Función para cargar lista de URLs
async function loadUrls() {
    const urlsList = document.getElementById('urlsList');
    
    try {
        const response = await fetch('/api/urls');
        const data = await response.json();
        
        if (response.ok) {
            if (data.requiresAuth) {
                // Usuario no autenticado
                currentUrls = [];
                renderUrls([], data.message);
            } else {
                currentUrls = data.urls;
                renderUrls(currentUrls);
            }
        } else {
            console.error('Error al cargar URLs:', data.error);
            // No mostrar error si es problema de Auth0 no configurado
            if (data.error && !data.error.includes('auth') && !data.error.includes('Auth0')) {
                showNotification('Error al cargar URLs', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        // Solo mostrar error si no es problema de conexión inicial
        if (error.message && !error.message.includes('Failed to fetch')) {
            showNotification('Error de conexión', 'error');
        }
    }
}

// Función para renderizar lista de URLs
function renderUrls(urls, customMessage = null) {
    const urlsList = document.getElementById('urlsList');
    
    if (urls.length === 0) {
        const message = customMessage || 'No hay URLs creadas aún';
        urlsList.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">${message}</p>`;
        return;
    }
    
    urlsList.innerHTML = urls.map(url => {
        const createdDate = new Date(url.created_at).toLocaleDateString('es-ES');
        const shortUrl = `${window.location.origin}/${url.short_code}`;
        
        return `
            <div class="url-item">
                <div class="url-header">
                    <a href="${shortUrl}" target="_blank" class="url-short">${shortUrl}</a>
                    <div class="url-actions">
                        <span class="url-clicks">${url.clicks} clicks</span>
                        <button onclick="showQRFromHistory('${url.short_code}')" class="qr-btn" title="Ver código QR">
                            <i class="fas fa-qrcode"></i>
                        </button>
                        <button onclick="deleteUrl('${url.short_code}')" class="delete-btn" title="Eliminar URL">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="url-original">${url.original_url}</div>
                <div class="url-date">Creada: ${createdDate}</div>
            </div>
        `;
    }).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    
    // Enfocar el input al cargar
    urlInput.focus();
    
    // Enter en el input de URL
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    });
    
    // Escape para volver al input
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const resultSection = document.getElementById('resultSection');
            if (!resultSection.classList.contains('hidden')) {
                createAnother();
            }
        }
    });
});

// Agregar animación fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    /* Modal QR Styles */
    .qr-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }

    .qr-modal-content {
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
    }

    .qr-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px 15px;
        border-bottom: 1px solid #eee;
    }

    .qr-modal-header h3 {
        margin: 0;
        color: #333;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .close-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .close-btn:hover {
        background: #c82333;
    }

    .qr-modal-body {
        padding: 25px;
        text-align: center;
    }

    .qr-modal-image {
        max-width: 100%;
        width: 250px;
        border: 3px solid #764ba2;
        border-radius: 15px;
        padding: 15px;
        background: white;
        margin-bottom: 15px;
    }

    .qr-url {
        color: #667eea;
        font-weight: 600;
        word-break: break-all;
        margin: 15px 0;
        padding: 15px;
        background: #f8f9ff;
        border-radius: 10px;
        border-left: 4px solid #17a2b8;
    }

    .qr-modal-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
    }

    .qr-modal-actions button {
        min-width: 120px;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: translateY(-50px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
