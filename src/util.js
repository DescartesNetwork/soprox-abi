const buffer = require('buffer');

const pack = (...items) => {
  return buffer.Buffer.concat(items.map(type => type.toBuffer()));
}

module.exports = { pack }