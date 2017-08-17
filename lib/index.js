'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseReplicator = require('./commons/base-replicator');

var _baseReplicator2 = _interopRequireDefault(_baseReplicator);

var _realtimeEngine = require('./realtime-engine');

var _realtimeEngine2 = _interopRequireDefault(_realtimeEngine);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug2.default)('realtime-replicator');

var RealtimeReplicator = function (_BaseReplicator) {
  _inherits(RealtimeReplicator, _BaseReplicator);

  function RealtimeReplicator(service) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, RealtimeReplicator);

    debug('constructor started');

    var _this = _possibleConstructorReturn(this, (RealtimeReplicator.__proto__ || Object.getPrototypeOf(RealtimeReplicator)).call(this, service, options));

    var engine = _this.engine = new _realtimeEngine2.default(service, options);
    _this.changeSort = function () {
      return engine.changeSort.apply(engine, arguments);
    };
    _this.on = function () {
      return engine.on.apply(engine, arguments);
    };
    _this.store = engine.store;

    debug('constructor ended');
    return _this;
  }

  return RealtimeReplicator;
}(_baseReplicator2.default);

exports.default = RealtimeReplicator;
module.exports = exports['default'];