import { MetaData } from './basic';
import { getModuleByName, loadModel } from './inject';
import { enhanceStore } from './store';

const defFun = () => undefined;

export function renderApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'stage', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      MetaData.clientStore = store;
      await loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      return appModule.default.views[appViewName];
    }

  };
}
export function ssrApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'stage', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      await loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      store.dispatch = defFun;
      return appModule.default.views[appViewName];
    }

  };
}