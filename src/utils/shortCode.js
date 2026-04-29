const { customAlphabet } = require('nanoid');
const shortid = require('shortid');

function createShortCodeGenerator({
  nanoidFactory = customAlphabet,
  shortidFactory = shortid.generate,
} = {}) {
  try {
    const nanoid = nanoidFactory(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      10
    );
    return () => nanoid();
  } catch (e) {
    return () => shortidFactory();
  }
}

function isValidShortCode(value) {
  return /^[a-zA-Z0-9]+$/.test(value) && value.length <= 20;
}

module.exports = { createShortCodeGenerator, isValidShortCode };
