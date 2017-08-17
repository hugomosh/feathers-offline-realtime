'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.stripProps = stripProps;
function isObject(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !Array.isArray(value) && value !== null;
}

function stripProps(obj, blacklist) {
  blacklist = Array.isArray(blacklist) ? blacklist : blacklist || [];
  var res = {};

  Object.keys(obj).forEach(function (prop) {
    if (blacklist.indexOf(prop) === -1) {
      var value = obj[prop];
      res[prop] = isObject(value) ? stripProps(value, blacklist) : value;
    }
  });

  return res;
}