import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { MetaData } from './basic';
import { getModuleByName, loadModel } from './inject';
import { enhanceStore } from './store';
import { env } from './env';

var reRender = function reRender() {
  return undefined;
};

var reRenderTimer = 0;
var appView = null;
export function viewHotReplacement(moduleName, views) {
  var module = MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn("[HMR] @clux Updated views: " + moduleName);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views[MetaData.appViewName];

    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(function () {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn("[HMR] @clux view re rendering");
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}

var defFun = function defFun() {
  return undefined;
};

export function renderApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  var store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(function (item) {
    return moduleGetter[item] && item !== appModuleName;
  });
  return {
    store: store,
    beforeRender: function beforeRender() {
      return _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var appModule;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (reRenderTimer) {
                  env.clearTimeout(reRenderTimer);
                  reRenderTimer = 0;
                }

                MetaData.clientStore = store;
                _context.next = 4;
                return loadModel(appModuleName, store);

              case 4:
                _context.next = 6;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return loadModel(moduleName, store);
                }));

              case 6:
                appModule = getModuleByName(appModuleName);
                return _context.abrupt("return", {
                  appView: appModule.default.views[appViewName],
                  setReRender: function setReRender(hotRender) {
                    reRender = hotRender;
                  }
                });

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  };
}
export function ssrApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  var store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(function (item) {
    return moduleGetter[item] && item !== appModuleName;
  });
  return {
    store: store,
    beforeRender: function beforeRender() {
      return _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var appModule;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return loadModel(appModuleName, store);

              case 2:
                _context2.next = 4;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return loadModel(moduleName, store);
                }));

              case 4:
                appModule = getModuleByName(appModuleName);
                store.dispatch = defFun;
                return _context2.abrupt("return", {
                  appView: appModule.default.views[appViewName]
                });

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  };
}