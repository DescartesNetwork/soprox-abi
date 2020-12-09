const BN = require('bn.js');

/**
 * Buffer patch
 */
const F = new BN('ffffffffffffffff', 16, 'le');
Buffer.prototype.writeBigUInt64LE = Buffer.prototype.writeBigUInt64LE || function (jsBigInt, offset = 0) {
  const bigInt = new BN(jsBigInt.toString());
  if (bigInt.gt(F)) throw new Error('BigInt is too big');
  const arrayBuf = bigInt.toArray('le', this.length);
  for (let i = 0; i < this.length; i++)
    this[i] = arrayBuf[i];
  return offset;
}

Buffer.prototype.readBigUInt64LE = Buffer.prototype.readBigUInt64LE || function (offset = 0) {
  const bigInt = new BN(this.toString('hex'), 16, 'le');
  if (bigInt.gt(F)) throw new Error('BigInt is too big');
  // Using global.BigInt instead of BigInt due to browser understanding
  return global.BigInt(bigInt.toString());
}

/**
 * Supportive functions
 */
const type2Write = (type) => {
  switch (type) {
    case 'u8':
      return 'writeUInt8';
    case 'u16':
      return 'writeUInt16LE';
    case 'u32':
      return 'writeUInt32LE';
    case 'u64':
      return 'writeBigUInt64LE';
    default:
      throw new Error('Invalid type');
  }
}

const type2Read = (type) => {
  switch (type) {
    case 'u8':
      return 'readUInt8';
    case 'u16':
      return 'readUInt16LE';
    case 'u32':
      return 'readUInt32LE';
    case 'u64':
      return 'readBigUInt64LE';
    default:
      throw new Error('Invalid type');
  }
}

/**
 * Unsigned integer
 */
class usize {
  constructor(value, type, byteLength) {
    this.value = value;
    this.type = type;
    this.space = byteLength;
  }

  toBuffer = () => {
    const buf = Buffer.allocUnsafe(this.space);
    buf[type2Write(this.type)](this.value);
    return buf;
  }

  fromBuffer = (buf) => {
    if (!Buffer.isBuffer(buf)) throw new Error('Invalid buffer');
    this.value = buf[type2Read(this.type)]();
    return this.value;
  }
}

class u8 extends usize {
  constructor(value = 0) {
    super(value, 'u8', 1);
  }
}

class u16 extends usize {
  constructor(value = 0) {
    super(value, 'u16', 2);
  }
}

class u32 extends usize {
  constructor(value = 0) {
    super(value, 'u32', 4);
  }
}

class u64 extends usize {
  constructor(value = 0) {
    super(value, 'u64', 8);
  }
}

module.exports = { u8, u16, u32, u64 }