const { isValidShortCode, createShortCodeGenerator } = require('../../src/utils/shortCode');

describe('shortCode utils', () => {
  it('isValidShortCode acepta alfanumérico <= 20', () => {
    expect(isValidShortCode('Abc123')).toBe(true);
    expect(isValidShortCode('A'.repeat(20))).toBe(true);
    expect(isValidShortCode('A'.repeat(21))).toBe(false);
    expect(isValidShortCode('abc-123')).toBe(false);
  });

  it('createShortCodeGenerator usa nanoid por defecto', () => {
    const generate = createShortCodeGenerator();
    const code = generate();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    expect(code.length).toBe(10);
  });

  it('createShortCodeGenerator hace fallback si nanoid falla', () => {
    const generate = createShortCodeGenerator({
      nanoidFactory: () => {
        throw new Error('fail');
      },
      shortidFactory: () => 'fallback123',
    });
    expect(generate()).toBe('fallback123');
  });
});
