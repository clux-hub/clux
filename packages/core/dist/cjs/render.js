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

function renderApp(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(baseStore, preloadModules, preloadComponents, moduleGetter, middlewares, appModuleName, appViewName) {
    var store, modules, appModule, AppView;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (appModuleName === void 0) {
              appModuleName = 'stage';
            }

            if (appViewName === void 0) {
              appViewName = 'main';
            }

            _basic.MetaData.appModuleName = appModuleName;
            _basic.MetaData.moduleGetter = moduleGetter;

            if (!(typeof moduleGetter[appModuleName] !== 'function')) {
              _context.next = 6;
              break;
            }

            throw appModuleName + " could not be found in moduleGetter";

          case 6:
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = (0, _store.enhanceStore)(baseStore, middlewares);
            _basic.MetaData.clientStore = store;
            _context.next = 12;
            return (0, _inject.getModuleList)(preloadModules);

          case 12:
            modules = _context.sent;
            _context.next = 15;
            return (0, _inject.getComponentList)(preloadComponents);

          case 15:
            appModule = modules[0].default;
            _context.next = 18;
            return appModule.model(store);

          case 18:
            AppView = (0, _inject.getComponet)(appModuleName, appViewName);
            return _context.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

function ssrApp(_x8, _x9, _x10, _x11, _x12, _x13) {
  return _ssrApp.apply(this, arguments);
}

function _ssrApp() {
  _ssrApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(baseStore, preloadModules, moduleGetter, middlewares, appModuleName, appViewName) {
    var store, _yield$getModuleList, appModule, otherModules, AppView;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (appModuleName === void 0) {
              appModuleName = 'stage';
            }

            if (appViewName === void 0) {
              appViewName = 'main';
            }

            _basic.MetaData.appModuleName = appModuleName;
            _basic.MetaData.moduleGetter = moduleGetter;

            if (!(typeof moduleGetter[appModuleName] !== 'function')) {
              _context2.next = 6;
              break;
            }

            throw appModuleName + " could not be found in moduleGetter";

          case 6:
            preloadModules = preloadModules.filter(function (moduleName) {
              return moduleGetter[moduleName] && moduleName !== appModuleName;
            });
            preloadModules.unshift(appModuleName);
            store = (0, _store.enhanceStore)(baseStore, middlewares);
            _context2.next = 11;
            return (0, _inject.getModuleList)(preloadModules);

          case 11:
            _yield$getModuleList = _context2.sent;
            appModule = _yield$getModuleList[0].default;
            otherModules = _yield$getModuleList.slice(1);
            _context2.next = 16;
            return appModule.model(store);

          case 16:
            _context2.next = 18;
            return Promise.all(otherModules.map(function (module) {
              return module.default.model(store);
            }));

          case 18:
            store.dispatch = defFun;
            AppView = (0, _inject.getComponet)(appModuleName, appViewName);
            return _context2.abrupt("return", {
              store: store,
              AppView: AppView
            });

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ssrApp.apply(this, arguments);
}