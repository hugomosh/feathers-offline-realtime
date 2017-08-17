'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentEmitter = require('component-emitter');

var _componentEmitter2 = _interopRequireDefault(_componentEmitter);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debug2.default)('base-engine');

var BaseEngine = function () {
  function BaseEngine(service) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BaseEngine);

    debug('constructor entered');

    this._service = service;
    this._publication = options.publication;
    this._subscriber = options.subscriber || function () {};
    this._sorter = options.sort;
    this._eventEmitter = new _componentEmitter2.default();

    this._listener = function (eventName) {
      return function (remoteRecord) {
        return _this._mutateStore(eventName, remoteRecord, 0);
      };
    };

    this._eventListeners = {
      created: this._listener('created'),
      updated: this._listener('updated'),
      patched: this._listener('patched'),
      removed: this._listener('removed')
    };

    this.useUuid = options.uuid;
    this.emit = this._eventEmitter.emit;
    this.on = this._eventEmitter.on;
    this.listening = false;

    this.store = {
      last: { eventName: '', action: '', record: {} },
      records: []
    };
  }

  _createClass(BaseEngine, [{
    key: 'snapshot',
    value: function snapshot(records) {
      debug('snapshot entered');

      this.store.last = { action: 'snapshot' };
      this.store.records = records;

      if (this._sorter) {
        records.sort(this._sorter);
      }

      this.emit('events', this.store.records, this.store.last);
      this._subscriber(this.store.records, this.store.last);
    }
  }, {
    key: 'addListeners',
    value: function addListeners() {
      debug('addListeners entered');
      var service = this._service;
      var eventListeners = this._eventListeners;

      service.on('created', eventListeners.created);
      service.on('updated', eventListeners.updated);
      service.on('patched', eventListeners.patched);
      service.on('removed', eventListeners.removed);

      this.listening = true;
      this.emit('events', this.store.records, { action: 'add-listeners' });
      this._subscriber(this.store.records, { action: 'add-listeners' });
    }
  }, {
    key: 'removeListeners',
    value: function removeListeners() {
      debug('removeListeners entered');

      if (this.listening) {
        var service = this._service;
        var eventListeners = this._eventListeners;

        service.removeListener('created', eventListeners.created);
        service.removeListener('updated', eventListeners.updated);
        service.removeListener('patched', eventListeners.patched);
        service.removeListener('removed', eventListeners.removed);

        this.listening = false;
        this.emit('events', this.store.records, { action: 'remove-listeners' });
        this._subscriber(this.store.records, { action: 'remove-listeners' });
      }
    }
  }, {
    key: '_mutateStore',
    value: function _mutateStore(eventName, remoteRecord, source) {
      debug('_mutateStore started: ' + eventName);
      var that = this;

      var idName = this._useUuid ? 'uuid' : 'id' in remoteRecord ? 'id' : '_id';
      var store = this.store;
      var records = store.records;

      var index = this._findIndex(records, function (record) {
        return record[idName] === remoteRecord[idName];
      });

      if (index >= 0) {
        records.splice(index, 1);
      }

      if (eventName === 'removed') {
        if (index >= 0) {
          broadcast('remove');
        } else if (source === 0 && (!this._publication || this._publication(remoteRecord))) {
          // Emit service event if it corresponds to a previous optimistic remove
          broadcast('remove');
        }

        return; // index >= 0 ? broadcast('remove') : undefined;
      }

      if (this._publication && !this._publication(remoteRecord)) {
        return index >= 0 ? broadcast('left-pub') : undefined;
      }

      records[records.length] = remoteRecord;

      if (this._sorter) {
        records.sort(this._sorter);
      }

      return broadcast('mutated');

      function broadcast(action) {
        debug('emitted ' + index + ' ' + eventName + ' ' + action);
        store.last = { source: source, action: action, eventName: eventName, record: remoteRecord };

        that.emit('events', records, store.last);
        that._subscriber(records, store.last);
      }
    }
  }, {
    key: 'changeSort',
    value: function changeSort(sort) {
      this._sorter = sort;

      if (this._sorter) {
        this.store.records.sort(this._sorter);
      }

      this.emit('events', this.store.records, { action: 'change-sort' });
      this._subscriber(this.store.records, { action: 'change-sort' });
    }
  }, {
    key: '_findIndex',
    value: function _findIndex(array) {
      var predicate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return true;
      };
      var fromIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      for (var i = fromIndex, len = array.length; i < len; i++) {
        if (predicate(array[i])) {
          return i;
        }
      }

      return -1;
    }
  }]);

  return BaseEngine;
}();

exports.default = BaseEngine;
module.exports = exports['default'];