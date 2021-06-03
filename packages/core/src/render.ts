/* eslint-disable no-await-in-loop */
import {MetaData, ModuleGetter, CommonModule, BStore, IStore} from './basic';
import {getModuleByName, loadModel} from './inject';
import {IStoreMiddleware, enhanceStore} from './store';

const defFun: any = () => undefined;

export function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preLoadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: IStoreMiddleware[],
  appModuleName: string = 'stage',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  preLoadModules = preLoadModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  return {
    store,
    async beforeRender() {
      MetaData.clientStore = store;
      await loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map((moduleName) => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName) as CommonModule;
      return appModule.default.views[appViewName];
    },
  };
}

export function ssrApp<ST extends BStore = BStore>(
  baseStore: ST,
  preLoadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: IStoreMiddleware[],
  appModuleName: string = 'stage',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  preLoadModules = preLoadModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  return {
    store,
    async beforeRender() {
      await loadModel(appModuleName, store);
      // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
      // preModules.unshift(appModuleName);
      await Promise.all(preLoadModules.map((moduleName) => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName) as CommonModule;
      store.dispatch = defFun;
      return appModule.default.views[appViewName];
    },
  };
}
