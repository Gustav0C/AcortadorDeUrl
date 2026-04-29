const { isValidUrl, normalizeUrl } = require('../../src/utils/url');

describe('url utils', () => {
  it('isValidUrl acepta http/https y rechaza inválidas', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('notaurl')).toBe(false);
  });

  it('normalizeUrl recorta, elimina hash y preserva query', () => {
    const input = '  https://example.com/path?x=1#frag  ';
    expect(normalizeUrl(input)).toBe('https://example.com/path?x=1');
  });

  it('normalizeUrl devuelve el input si no es parseable', () => {
    expect(normalizeUrl('notaurl')).toBe('notaurl');
  });
});
