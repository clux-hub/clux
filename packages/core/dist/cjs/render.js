"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.renderApp = renderApp;
exports.ssrApp = ssrApp;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

var defFun = function defFun() {
  return undefined;
};

function renderApp(baseStore, preloadModules, preloadComponents, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.moduleGetter = moduleGetter;

  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw appModuleName + " could not be found in moduleGetter";
  }

  preloadModules = preloadModules.filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== appModuleName;
  });
  preloadModules.unshift(appModuleName);
  var store = (0, _store.enhanceStore)(baseStore, middlewares);
  return {
    store: store,
    beforeRender: function beforeRender() {
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
        var modules, appModule;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _basic.MetaData.clientStore = store;
                _context.next = 3;
                return (0, _inject.getModuleList)(preloadModules);

              case 3:
                modules = _context.sent;
                _context.next = 6;
                return (0, _inject.getComponentList)(preloadComponents);

              case 6:
                appModule = modules[0].default;
                _context.next = 9;
                return appModule.model(store);

              case 9:
                return _context.abrupt("return", (0, _inject.getComponet)(appModuleName, appViewName));

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  };
}

function ssrApp(baseStore, preloadModules, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.moduleGetter = moduleGetter;

  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw appModuleName + " could not be found in moduleGetter";
  }

  preloadModules = preloadModules.filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== appModuleName;
  });
  preloadModules.unshift(appModuleName);
  var store = (0, _store.enhanceStore)(baseStore, middlewares);
  return {
    store: store,
    beforeRender: function beforeRender() {
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var _yield$getModuleList, appModule, otherModules;

        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _inject.getModuleList)(preloadModules);

              case 2:
                _yield$getModuleList = _context2.sent;
                appModule = _yield$getModuleList[0].default;
                otherModules = _yield$getModuleList.slice(1);
                _context2.next = 7;
                return appModule.model(store);

              case 7:
                _context2.next = 9;
                return Promise.all(otherModules.map(function (module) {
                  return module.default.model(store);
                }));

              case 9:
                store.dispatch = defFun;
                return _context2.abrupt("return", (0, _inject.getComponet)(appModuleName, appViewName));

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  };
}