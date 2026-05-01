const shortid = require('shortid');

function createShortCodeGenerator() {
  return () => shortid.generate();
}

function isValidShortCode(value) {
  return /^[a-zA-Z0-9_-]+$/.test(value) && value.length <= 20;
}

module.exports = { createShortCodeGenerator, isValidShortCode };