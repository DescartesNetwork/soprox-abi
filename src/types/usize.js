const BN = require('bn.js');

/**
 * Buffer patch
 */
const F = new BN(Buffer.from('ffffffffffffffff', 'hex'), 16, 'le');
const FF = new BN(Buffer.from('ffffffffffffffffffffffffffffffff', 'hex'), 16, 'le');
Buffer.prototype.writeBigUInt64LE = Buffer.prototype.writeBigUInt64LE || function (jsBigInt, offset = 0) {
  const bigInt = new BN(jsBigInt.toString());
  if (bigInt.gt(F)) throw new Error('BigInt is too big');
  const arrayBuf = bigInt.toArray('le', this.length);
  for (let i = 0; i < this.length; i++)
    this[i] = arrayBuf[i];
  return offset;
}
Buffer.prototype.readBigUInt64LE = Buffer.prototype.readBigUInt64LE || function (offset = 0) {
  const bigInt = new BN(this, 16, 'le');
  if (bigInt.gt(F)) throw new Error('BigInt is too big');
  // Using global.BigInt instead of BigInt due to browser understanding
  return global.BigInt(bigInt.toString());
}
Buffer.prototype.writeBigUInt128LE = Buffer.prototype.writeBigUInt128LE || function (jsBigInt, offset = 0) {
  const bigInt = new BN(jsBigInt.toString());
  if (bigInt.gt(FF)) throw new Error('BigInt is too big');
  const arrayBuf = bigInt.toArray('le', this.length);
  for (let i = 0; i < this.length; i++)
    this[i] = arrayBuf[i];
  return offset;
}
Buffer.prototype.readBigUInt128LE = Buffer.prototype.readBigUInt128LE || function (offset = 0) {
  const bigInt = new BN(this, 16, 'le');
  if (bigInt.gt(FF)) throw new Error('BigInt is too big');
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
    case 'u128':
      return 'writeBigUInt128LE';
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
    case 'u128':
      return 'readBigUInt128LE';
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
    buf[type2Write(this.type)](this.value, 0);
    return buf;
  }

  fromBuffer = (buf) => {
    if (!Buffer.isBuffer(buf)) throw new Error('Invalid buffer');
    this.value = buf[type2Read(this.type)](0);
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

class u128 extends usize {
  constructor(value = 0) {
    super(value, 'u128', 16);
  }
}

module.exports = { u8, u16, u32, u64, u128 }