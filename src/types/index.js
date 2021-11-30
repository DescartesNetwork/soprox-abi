const { bool } = require('./bool')
const { char } = require('./char')
const { u8, u16, u32, u64, u128 } = require('./usize')
const { i8, i16, i32, i64, i128 } = require('./isize')
const { array } = require('./array')
const { tuple } = require('./tuple')
const { pub } = require('./pub')

module.exports = {
  bool,
  char,
  u8,
  u16,
  u32,
  u64,
  u128,
  i8,
  i16,
  i32,
  i64,
  i128,
  array,
  tuple,
  pub,
}
