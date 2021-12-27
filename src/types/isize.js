const BN = require('bn.js')

/**
 * Buffer patch
 */
const ZERO = new BN(0)
const ONE = new BN(1)
const NEONE = new BN(-1)
const F = new BN(Buffer.from('ffffffffffffffff', 'hex'), 16, 'le')
const FMAX = new BN(Buffer.from('ffffffffffffff7f', 'hex'), 16, 'le')
const FMIN = FMAX.mul(NEONE).add(NEONE)
const FF = new BN(
  Buffer.from('ffffffffffffffffffffffffffffffff', 'hex'),
  16,
  'le',
)
const FFMAX = new BN(
  Buffer.from('ffffffffffffffffffffffffffffff7f', 'hex'),
  16,
  'le',
)
const FFMIN = FFMAX.mul(NEONE).add(NEONE)
Buffer.prototype.writeBigInt64LE =
  Buffer.prototype.writeBigInt64LE ||
  function (jsBigInt, offset = 0) {
    const bigInt = new BN(jsBigInt.toString())
    if (bigInt.gt(FMAX) || bigInt.lt(FMIN)) throw new Error('BigInt is too big')
    const transformedBigInt = bigInt.gte(ZERO) ? bigInt : F.add(bigInt).add(ONE)
    const arrayBuf = transformedBigInt.toArray('le', this.length)
    for (let i = 0; i < this.length; i++) this[i] = arrayBuf[i]
    return offset
  }
Buffer.prototype.readBigInt64LE =
  Buffer.prototype.readBigInt64LE ||
  function (offset = 0) {
    let bigInt = new BN(this, 16, 'le')
    if (bigInt.gt(F)) throw new Error('BigInt is too big')
    if (bigInt.gt(FMAX)) bigInt = NEONE.sub(F.sub(bigInt))
    // Using global.BigInt instead of BigInt due to browser understanding
    return global.BigInt(bigInt.toString())
  }
Buffer.prototype.writeBigInt128LE =
  Buffer.prototype.writeBigInt128LE ||
  function (jsBigInt, offset = 0) {
    const bigInt = new BN(jsBigInt.toString())
    if (bigInt.gt(FFMAX) || bigInt.lt(FFMIN))
      throw new Error('BigInt is too big')
    const transformedBigInt = bigInt.gte(ZERO)
      ? bigInt
      : FF.add(bigInt).add(ONE)
    const arrayBuf = transformedBigInt.toArray('le', this.length)
    for (let i = 0; i < this.length; i++) this[i] = arrayBuf[i]
    return offset
  }
Buffer.prototype.readBigInt128LE =
  Buffer.prototype.readBigInt128LE ||
  function (offset = 0) {
    let bigInt = new BN(this, 16, 'le')
    if (bigInt.gt(FF)) throw new Error('BigInt is too big')
    if (bigInt.gt(FFMAX)) bigInt = NEONE.sub(FF.sub(bigInt))
    // Using global.BigInt instead of BigInt due to browser understanding
    return global.BigInt(bigInt.toString())
  }
/**
 * Supportive functions
 */
const type2Write = (type) => {
  switch (type) {
    case 'i8':
      return 'writeInt8'
    case 'i16':
      return 'writeInt16LE'
    case 'i32':
      return 'writeInt32LE'
    case 'i64':
      return 'writeBigInt64LE'
    case 'i128':
      return 'writeBigInt128LE'
    default:
      throw new Error('Invalid type')
  }
}

const type2Read = (type) => {
  switch (type) {
    case 'i8':
      return 'readInt8'
    case 'i16':
      return 'readInt16LE'
    case 'i32':
      return 'readInt32LE'
    case 'i64':
      return 'readBigInt64LE'
    case 'i128':
      return 'readBigInt128LE'
    default:
      throw new Error('Invalid type')
  }
}

/**
 * Signed integer
 */
class isize {
  constructor(value, type, byteLength) {
    this.value = value
    this.type = type
    this.space = byteLength
  }

  toBuffer = () => {
    const buf = Buffer.allocUnsafe(this.space)
    buf[type2Write(this.type)](this.value, 0)
    return buf
  }

  fromBuffer = (buf) => {
    if (!Buffer.isBuffer(buf)) throw new Error('Invalid buffer')
    this.value = buf[type2Read(this.type)](0)
    return this.value
  }
}

class i8 extends isize {
  constructor(value = 0) {
    super(value, 'i8', 1)
  }
}

class i16 extends isize {
  constructor(value = 0) {
    super(value, 'i16', 2)
  }
}

class i32 extends isize {
  constructor(value = 0) {
    super(value, 'i32', 4)
  }
}

class i64 extends isize {
  constructor(value = 0) {
    super(value, 'i64', 8)
  }
}

class i128 extends isize {
  constructor(value = 0) {
    super(value, 'i128', 16)
  }
}

module.exports = { i8, i16, i32, i64, i128 }
