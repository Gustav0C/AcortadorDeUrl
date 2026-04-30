const shortid = require('shortid');

function createShortCodeGenerator() {
  return () => shortid.generate();
}
}

function isValidShortCode(value) {
  return /^[a-zA-Z0-9]+$/.test(value) && value.length <= 20;
}

module.exports = { createShortCodeGenerator, isValidShortCode };
