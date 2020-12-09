const buffer = require('buffer');

/**
 * Character (UTF8)
 */
class char {
  constructor(value) {
    this.value = value;
    this.type = 'char';
    this.space = 4;
  }

  toBuffer = () => {
    const buf = buffer.Buffer.from(this.value, 'utf8');
    if (buf.length > this.space) throw new Error('Invalid char');
    if (buf.length < this.space) return buffer.Buffer.concat([buf, buffer.Buffer.alloc(this.space - buf.length)]);
    return buf;
  }

  fromBuffer = (buf) => {
    if (!buffer.Buffer.isBuffer(buf)) throw new Error('Invalid buffer');
    buf = buffer.Buffer(buf); // Make sure using intened buffer.Buffer
    this.value = buf.toString('utf8');
    return this.value;
  }
}

module.exports = { char }