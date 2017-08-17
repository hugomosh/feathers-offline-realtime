'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _feathersOfflineSnapshot = require('feathers-offline-snapshot');

var _feathersOfflineSnapshot2 = _interopRequireDefault(_feathersOfflineSnapshot);

var _utils = require('./utils');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debug2.default)('base-replicator');

var BaseReplicator = function () {
  function BaseReplicator(service) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BaseReplicator);

    debug('constructor entered');

    // Higher order class defines: this.engine, this.store, this.changeSort, this.on

    this._service = service;
    this._query = options.query || {};
    this._publication = options.publication;

    this.genShortUuid = true;
  }

  _createClass(BaseReplicator, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      this.engine.removeListeners();

      return (0, _feathersOfflineSnapshot2.default)(this._service, this._query).then(function (records) {
        records = _this._publication ? records.filter(_this._publication) : records;
        records = _this.engine.sorter ? records.sort(_this.engine.sorter) : records;

        _this.engine.snapshot(records);
        _this.engine.addListeners();
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.engine.removeListeners();
    }
  }, {
    key: 'useShortUuid',
    value: function useShortUuid(ifShortUuid) {
      this.genShortUuid = !!ifShortUuid;
    }
  }, {
    key: 'getUuid',
    value: function getUuid() {
      return (0, _utils.genUuid)(this.genShortUuid);
    }

    // array.sort(Realtime.sort('fieldName'));

  }, {
    key: 'connected',
    get: function get() {
      return this.engine.listening;
    }
  }], [{
    key: 'sort',
    value: function sort(prop) {
      return function (a, b) {
        return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
      };
    }

    // array.sort(Realtime.multiSort({ field1: 1, field2: -1 }))

  }, {
    key: 'multiSort',
    value: function multiSort(order) {
      var props = Object.keys(order);
      var len = props.length;

      return function (a, b) {
        var result = 0;
        var i = 0;

        while (result === 0 && i < len) {
          var prop = props[i];
          var sense = order[prop];

          result = a[prop] > b[prop] ? 1 * sense : a[prop] < b[prop] ? -1 * sense : 0;
          i++;
        }

        return result;
      };
    }
  }]);

  return BaseReplicator;
}();

exports.default = BaseReplicator;
module.exports = exports['default'];