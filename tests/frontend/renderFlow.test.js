const { buildUrlsHtml } = require('../../public/js/utils');

describe('frontend utils: render', () => {
  it('buildUrlsHtml renderiza mensaje cuando no hay URLs', () => {
    const html = buildUrlsHtml([], null, 'https://example.com');
    expect(html).toContain('No hay URLs creadas aún');
  });

  it('buildUrlsHtml genera cards para URLs', () => {
    const html = buildUrlsHtml([
      {
        short_code: 'abc123',
        original_url: 'https://example.com/long',
        clicks: 5,
        created_at: '2024-01-01T00:00:00Z'
      }
    ], null, 'https://example.com');

    expect(html).toContain('https://example.com/abc123');
    expect(html).toContain('5 clicks');
  });
});
