const { isValidUrl, escapeHtml, getShortCodeFromUrl } = require('../../public/js/utils');

describe('frontend utils: helpers', () => {
  it('isValidUrl acepta http/https', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('notaurl')).toBe(false);
  });

  it('escapeHtml sanitiza caracteres peligrosos', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('getShortCodeFromUrl extrae el último segmento', () => {
    expect(getShortCodeFromUrl('https://x.io/abc123')).toBe('abc123');
  });
});
