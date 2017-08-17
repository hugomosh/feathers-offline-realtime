'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
/*
 Forked from feathers-memory/src/index.js
 */


exports.default = init;

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _feathersQueryFilters = require('feathers-query-filters');

var _feathersQueryFilters2 = _interopRequireDefault(_feathersQueryFilters);

var _feathersCommons = require('feathers-commons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = function () {
  function Service() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Service);

    this._replicator = options.replicator;
    this._engine = this._replicator.engine;

    if (!this._engine.useUuid) {
      throw new Error('Replicator must be configured for uuid for optimistic updates. (offline)');
    }

    this._mutateStore = this._engine._mutateStore.bind(this._engine);
    this._alwaysSelect = ['id', '_id', 'uuid'];
    this._getUuid = this._replicator.getUuid;

    this.store = this._engine.store || { records: [] };
    this.paginate = options.paginate || {};
  }

  _createClass(Service, [{
    key: 'extend',
    value: function extend(obj) {
      return _uberproto2.default.extend(obj, this);
    }

    // Find without hooks and mixins that can be used internally and always returns
    // a pagination object

  }, {
    key: '_find',
    value: function _find(params) {
      var getFilter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _feathersQueryFilters2.default;

      var _getFilter = getFilter(params.query || {}),
          query = _getFilter.query,
          filters = _getFilter.filters;

      var values = _feathersCommons._.values(this.store.records).filter((0, _feathersCommons.matcher)(query));

      var total = values.length;

      if (filters.$sort) {
        values.sort((0, _feathersCommons.sorter)(filters.$sort));
      }

      if (filters.$skip) {
        values = values.slice(filters.$skip);
      }

      if (typeof filters.$limit !== 'undefined') {
        values = values.slice(0, filters.$limit);
      }

      if (filters.$select) {
        values = values.map(function (value) {
          return _feathersCommons._.pick.apply(_feathersCommons._, [value].concat(_toConsumableArray(filters.$select)));
        });
      }

      return Promise.resolve({
        total: total,
        limit: filters.$limit,
        skip: filters.$skip || 0,
        data: values
      });
    }
  }, {
    key: 'find',
    value: function find(params) {
      var paginate = typeof params.paginate !== 'undefined' ? params.paginate : this.paginate;
      // Call the internal find with query parameter that include pagination
      var result = this._find(params, function (query) {
        return (0, _feathersQueryFilters2.default)(query, paginate);
      });

      if (!(paginate && paginate.default)) {
        return result.then(function (page) {
          return page.data;
        });
      }

      return result;
    }
  }, {
    key: 'get',
    value: function get(uuid, params) {
      var records = this.store.records;
      var index = findUuidIndex(records, uuid);

      if (index === -1) {
        return Promise.reject(new _feathersErrors2.default.NotFound('No record found for uuid \'' + uuid + '\''));
      }

      return Promise.resolve(records[index]).then(_feathersCommons.select.apply(undefined, [params].concat(_toConsumableArray(this._alwaysSelect))));
    }

    // Create without hooks and mixins that can be used internally

  }, {
    key: '_create',
    value: function _create(data, params) {
      var _this = this;

      this._checkConnected();

      if (!('uuid' in data)) {
        data.uuid = this._getUuid();
      }

      var records = this.store.records;
      var index = findUuidIndex(records, data.uuid);
      if (index > -1) {
        throw new _feathersErrors2.default.BadRequest('Optimistic create requires unique uuid. (offline)');
      }

      // optimistic mutation
      this._mutateStore('created', data, 1);

      // Start actual mutation on remote service
      this._replicator._service.create(shallowClone(data), params).catch(function () {
        _this._mutateStore('removed', data, 2);
      });

      return Promise.resolve(data).then(_feathersCommons.select.apply(undefined, [params].concat(_toConsumableArray(this._alwaysSelect))));
    }
  }, {
    key: 'create',
    value: function create(data, params) {
      var _this2 = this;

      if (Array.isArray(data)) {
        return Promise.all(data.map(function (current) {
          return _this2._create(current);
        }));
      }

      return this._create(data, params);
    }

    // Update without hooks and mixins that can be used internally

  }, {
    key: '_update',
    value: function _update(uuid, data, params) {
      var _this3 = this;

      this._checkConnected();
      checkUuidExists(data);

      var records = this.store.records;
      var index = findUuidIndex(records, uuid);
      if (index === -1) {
        return Promise.reject(new _feathersErrors2.default.NotFound('No record found for uuid \'' + uuid + '\''));
      }

      // We don't want our id to change type if it can be coerced
      var beforeRecord = shallowClone(records[index]);
      var beforeUuid = beforeRecord.uuid;
      data.uuid = beforeUuid == uuid ? beforeUuid : uuid; // eslint-disable-line

      // Optimistic mutation
      this._mutateStore('updated', data, 1);

      // Start actual mutation on remote service
      this._replicator._service.update(getId(data), shallowClone(data), params).catch(function () {
        _this3._mutateStore('updated', beforeRecord, 2);
      });

      return Promise.resolve(data).then(_feathersCommons.select.apply(undefined, [params].concat(_toConsumableArray(this._alwaysSelect))));
    }
  }, {
    key: 'update',
    value: function update(uuid, data, params) {
      if (uuid === null || Array.isArray(data)) {
        return Promise.reject(new _feathersErrors2.default.BadRequest('You can not replace multiple instances. Did you mean \'patch\'?'));
      }

      return this._update(uuid, data, params);
    }

    // Patch without hooks and mixins that can be used internally

  }, {
    key: '_patch',
    value: function _patch(uuid, data, params) {
      var _this4 = this;

      this._checkConnected();

      var records = this.store.records;
      var index = findUuidIndex(records, uuid);
      if (index === -1) {
        return Promise.reject(new _feathersErrors2.default.NotFound('No record found for uuid \'' + uuid + '\''));
      }

      // Optimistic mutation
      var beforeRecord = shallowClone(records[index]);
      var afterRecord = Object.assign({}, beforeRecord, data);
      this._mutateStore('patched', afterRecord, 1);

      // Start actual mutation on remote service
      this._replicator._service.patch(getId(beforeRecord), shallowClone(data), params).catch(function () {
        _this4._mutateStore('updated', beforeRecord, 2);
      });

      return Promise.resolve(afterRecord).then(_feathersCommons.select.apply(undefined, [params].concat(_toConsumableArray(this._alwaysSelect))));
    }
  }, {
    key: 'patch',
    value: function patch(uuid, data, params) {
      var _this5 = this;

      if (uuid === null) {
        return this._find(params).then(function (page) {
          return Promise.all(page.data.map(function (current) {
            return _this5._patch(current.uuid, data, params);
          }));
        });
      }

      return this._patch(uuid, data, params);
    }

    // Remove without hooks and mixins that can be used internally

  }, {
    key: '_remove',
    value: function _remove(uuid, params) {
      var _this6 = this;

      this._checkConnected();

      var records = this.store.records;
      var index = findUuidIndex(records, uuid);
      if (index === -1) {
        return Promise.reject(new _feathersErrors2.default.NotFound('No record found for uuid \'' + uuid + '\''));
      }

      // Optimistic mutation
      var beforeRecord = shallowClone(records[index]);
      this._mutateStore('removed', beforeRecord, 1);

      // Start actual mutation on remote service
      this._replicator._service.remove(getId(beforeRecord), params).catch(function () {
        _this6._mutateStore('created', beforeRecord, 2);
      });

      return Promise.resolve(beforeRecord).then(_feathersCommons.select.apply(undefined, [params].concat(_toConsumableArray(this._alwaysSelect))));
    }
  }, {
    key: 'remove',
    value: function remove(uuid, params) {
      var _this7 = this;

      if (uuid === null) {
        return this._find(params).then(function (page) {
          return Promise.all(page.data.map(function (current) {
            return _this7._remove(current.uuid, params);
          }));
        });
      }

      return this._remove(uuid, params);
    }
  }, {
    key: '_checkConnected',
    value: function _checkConnected() {
      if (!this._replicator.connected) {
        throw new _feathersErrors2.default.BadRequest('Replicator not connected to remote. (offline)');
      }
    }
  }]);

  return Service;
}();

function init(options) {
  return new Service(options);
}

init.Service = Service;

// Helpers

function findUuidIndex(array, uuid) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i].uuid == uuid) {
      // eslint-disable-line
      return i;
    }
  }

  return -1;
}

function checkUuidExists(record) {
  if (!('uuid' in record)) {
    throw new _feathersErrors2.default.BadRequest('Optimistic mutation requires uuid. (offline)');
  }
}

function getId(record) {
  return 'id' in record ? record.id : record._id;
}

function shallowClone(obj) {
  return Object.assign({}, obj);
}
module.exports = exports['default'];