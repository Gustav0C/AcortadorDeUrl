const validator = require('url-validator');

function isValidUrl(value) {
  try {
    return Boolean(validator(value));
  } catch (err) {
    return false;
  }
}

function normalizeUrl(input) {
  let normalized = String(input).trim();
  try {
    const urlObj = new URL(normalized);
    normalized =
      urlObj.protocol +
      '//' +
      urlObj.hostname +
      urlObj.pathname +
      urlObj.search;
  } catch (e) {
    // si falla, devolver el input recortado
  }
  return normalized;
}

module.exports = { isValidUrl, normalizeUrl };
