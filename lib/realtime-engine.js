'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseEngine = require('./commons/base-engine');

var _baseEngine2 = _interopRequireDefault(_baseEngine);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug2.default)('realtime-engine');

var RealtimeEngine = function (_BaseEngine) {
  _inherits(RealtimeEngine, _BaseEngine);

  function RealtimeEngine(service) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, RealtimeEngine);

    debug('constructor started');

    var _this = _possibleConstructorReturn(this, (RealtimeEngine.__proto__ || Object.getPrototypeOf(RealtimeEngine)).call(this, service, options));

    debug('constructor ended');
    return _this;
  }

  return RealtimeEngine;
}(_baseEngine2.default);

exports.default = RealtimeEngine;
module.exports = exports['default'];