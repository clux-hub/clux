"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.exportModule = exportModule;
exports.getModule = getModule;
exports.getModuleList = getModuleList;
exports.loadModel = _loadModel;
exports.getComponet = getComponet;
exports.getComponentList = getComponentList;
exports.getCachedModules = getCachedModules;
exports.getRootModuleAPI = getRootModuleAPI;
exports.defineView = defineView;
exports.CoreModuleHandlers = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _sprite = require("./sprite");

var _basic = require("./basic");

var _env = require("./env");

function exportModule(moduleName, ModuleHandles, params, components) {
  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var moduleHandles = new ModuleHandles(moduleName);
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.store = store;
      (0, _basic.injectActions)(moduleName, moduleHandles);
      var _initState = moduleHandles.initState;
      var preModuleState = store.getState(moduleName);

      if (preModuleState) {
        return store.dispatch((0, _basic.moduleReInitAction)(moduleName, _initState));
      }

      return store.dispatch((0, _basic.moduleInitAction)(moduleName, _initState));
    }

    return undefined;
  };

  return {
    moduleName: moduleName,
    model: model,
    components: components,
    state: undefined,
    params: params,
    actions: undefined
  };
}

function getModule(moduleName) {
  if (_basic.MetaData.moduleCaches[moduleName]) {
    return _basic.MetaData.moduleCaches[moduleName];
  }

  var moduleOrPromise = _basic.MetaData.moduleGetter[moduleName]();

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      _basic.MetaData.moduleCaches[moduleName] = module;
      return module;
    });
  }

  _basic.MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

function getModuleList(moduleNames) {
  if (moduleNames.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(moduleNames.map(function (moduleName) {
    if (_basic.MetaData.moduleCaches[moduleName]) {
      return _basic.MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  }));
}

function _loadModel(moduleName, store) {
  if (store === void 0) {
    store = _basic.MetaData.clientStore;
  }

  var moduleOrPromise = getModule(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.default.model(store);
    });
  }

  return moduleOrPromise.default.model(store);
}

function getComponet(moduleName, componentName, initView) {
  var key = [moduleName, componentName].join(_basic.config.CSP);

  if (_basic.MetaData.componentCaches[key]) {
    return _basic.MetaData.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrPromise = module.default.components[componentName]();

    if ((0, _sprite.isPromise)(componentOrPromise)) {
      return componentOrPromise.then(function (view) {
        _basic.MetaData.componentCaches[key] = view;

        if (view[_basic.config.ViewFlag] && initView && !_env.env.isServer) {
          module.default.model(_basic.MetaData.clientStore);
        }

        return view;
      });
    }

    _basic.MetaData.componentCaches[key] = componentOrPromise;

    if (componentOrPromise[_basic.config.ViewFlag] && initView && !_env.env.isServer) {
      module.default.model(_basic.MetaData.clientStore);
    }

    return componentOrPromise;
  };

  var moduleOrPromise = getModule(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}

function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(function (key) {
    if (_basic.MetaData.componentCaches[key]) {
      return _basic.MetaData.componentCaches[key];
    }

    var _key$split = key.split(_basic.config.CSP),
        moduleName = _key$split[0],
        componentName = _key$split[1];

    return getComponet(moduleName, componentName);
  }));
}

function getCachedModules() {
  return _basic.MetaData.moduleCaches;
}

var CoreModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
  var CoreModuleHandlers = function CoreModuleHandlers(moduleName, initState) {
    _initialize(this);

    this.moduleName = moduleName;
    this.initState = initState;
  };

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "store",
      value: void 0
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return _basic.MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return _basic.MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store.getCurrentState(this.moduleName);
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Update",
      value: function Update(payload, key) {
        return (0, _basic.mergeState)(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Loading",
      value: function Loading(payload) {
        var loading = (0, _basic.mergeState)(this.state.loading, payload);
        return (0, _basic.mergeState)(this.state, {
          loading: loading
        });
      }
    }]
  };
});
exports.CoreModuleHandlers = CoreModuleHandlers;

function getRootModuleAPI(data) {
  if (!_basic.MetaData.facadeMap) {
    if (data) {
      _basic.MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + _basic.config.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + _basic.config.NSP + actionName;
        });
        var moduleFacade = {
          name: moduleName,
          actions: actions,
          actionNames: actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      var cacheData = {};
      _basic.MetaData.facadeMap = new Proxy({}, {
        set: function set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },
        get: function get(target, moduleName, receiver) {
          var val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get: function get(__, actionName) {
                  return moduleName + _basic.config.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + _basic.config.NSP + actionName,
                      payload: payload
                    };
                  };
                }
              })
            };
          }

          return cacheData[moduleName];
        }
      });
    }
  }

  return _basic.MetaData.facadeMap;
}

function defineView(component) {
  component[_basic.config.ViewFlag] = true;
  return component;
}