(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppUtils = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function getShortCodeFromUrl(shortUrl) {
    return String(shortUrl || '').split('/').pop();
  }

  function buildUrlsHtml(urls, customMessage, origin) {
    if (!Array.isArray(urls) || urls.length === 0) {
      const message = customMessage || 'No hay URLs creadas aún';
      return `<p style="text-align: center; color: #666; padding: 20px;">${escapeHtml(message)}</p>`;
    }

    return urls.map(url => {
      const createdDate = new Date(url.created_at).toLocaleDateString('es-ES');
      const shortUrl = `${origin}/${url.short_code}`;

      return `
        <div class="url-item">
          <div class="url-header">
            <a href="${escapeHtml(shortUrl)}" target="_blank" class="url-short">${escapeHtml(shortUrl)}</a>
            <div class="url-actions">
              <span class="url-clicks">${escapeHtml(String(url.clicks))} clicks</span>
              <button onclick="showQRFromHistory('${escapeHtml(url.short_code)}')" class="qr-btn" title="Ver código QR">
                <i class="fas fa-qrcode"></i>
              </button>
              <button onclick="deleteUrl('${escapeHtml(url.short_code)}')" class="delete-btn" title="Eliminar URL">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="url-original">${escapeHtml(url.original_url)}</div>
          <div class="url-date">Creada: ${escapeHtml(createdDate)}</div>
        </div>
      `;
    }).join('');
  }

  return { isValidUrl, escapeHtml, getShortCodeFromUrl, buildUrlsHtml };
});
