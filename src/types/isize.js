const BN = require('bn.js');

/**
 * Buffer patch
 */
const ONE = new BN(1);
const NEONE = new BN(-1);
const F = new BN('ffffffffffffffff', 16, 'le');
const MAX = new BN('ffffffffffffff7f', 16, 'le');
const MIN = MAX.mul(NEONE).add(NEONE);
Buffer.prototype.writeBigInt64LE = Buffer.prototype.writeBigInt64LE || function (jsBigInt, offset = 0) {
  const bigInt = new BN(jsBigInt.toString());
  if (bigInt.gt(MAX) || bigInt.lt(MIN)) throw new Error('BigInt is too big');
  const reverseBigInt = F.add(bigInt).add(ONE);
  const arrayBuf = reverseBigInt.toArray('le', this.length);
  for (let i = 0; i < this.length; i++)
    this[i] = arrayBuf[i];
  return offset;
}
Buffer.prototype.readBigInt64LE = Buffer.prototype.readBigInt64LE || function (offset = 0) {
  let bigInt = new BN(this.toString('hex'), 16, 'le');
  if (bigInt.gt(F)) throw new Error('BigInt is too big');
  if (bigInt.gt(MAX)) bigInt = F.sub(bigInt).add(ONE);
  // Using global.BigInt instead of BigInt due to browser understanding
  return global.BigInt(bigInt.toString());
}
/**
 * Supportive functions
 */
const type2Write = (type) => {
  switch (type) {
    case 'i8':
      return 'writeInt8';
    case 'i16':
      return 'writeInt16LE';
    case 'i32':
      return 'writeInt32LE';
    case 'i64':
      return 'writeBigInt64LE';
    default:
      throw new Error('Invalid type');
  }
}

const type2Read = (type) => {
  switch (type) {
    case 'i8':
      return 'readInt8';
    case 'i16':
      return 'readInt16LE';
    case 'i32':
      return 'readInt32LE';
    case 'i64':
      return 'readBigInt64LE';
    default:
      throw new Error('Invalid type');
  }
}

/**
 * Signed integer
 */
class isize {
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

class i8 extends isize {
  constructor(value = 0) {
    super(value, 'i8', 1);
  }
}

class i16 extends isize {
  constructor(value = 0) {
    super(value, 'i16', 2);
  }
}

class i32 extends isize {
  constructor(value = 0) {
    super(value, 'i32', 4);
  }
}

class i64 extends isize {
  constructor(value = 0) {
    super(value, 'i64', 8);
  }
}

let a = new i64(-1234n);
// let b = new i64(1234n);
// console.log(b.toBuffer());
let buf = a.toBuffer();
console.log(buf);

module.exports = { i8, i16, i32, i64 }