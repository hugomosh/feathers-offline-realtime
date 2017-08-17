'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genUuid = genUuid;
exports.hash = hash;
exports.hashOfRecord = hashOfRecord;

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _misc = require('./misc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Integrity of short unique identifiers: https://github.com/dylang/shortid/issues/81#issuecomment-259812835

function genUuid(ifShortUuid) {
  return ifShortUuid ? _shortid2.default.generate() : (0, _v2.default)();
}

function hash(value) {
  value = typeof value === 'string' ? value : JSON.stringify(value);
  return (0, _md2.default)(value);
}

function hashOfRecord(record) {
  return hash((0, _misc.stripProps)(record, ['id', '_id']));
}