/* eslint-disable no-await-in-loop */
import {MetaData, ModuleGetter, BStore, IStore} from './basic';
import {getModuleList, getComponentList, getComponet} from './inject';
import {IStoreMiddleware, enhanceStore} from './store';

const defFun: any = () => undefined;

export function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  preloadComponents: string[],
  moduleGetter: ModuleGetter,
  middlewares?: IStoreMiddleware[],
  appModuleName: string = 'stage',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw `${appModuleName} could not be found in moduleGetter`;
  }
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  return {
    store,
    async beforeRender() {
      MetaData.clientStore = store;
      // 防止view中瀑布式懒加载
      const modules = await getModuleList(preloadModules);
      await getComponentList(preloadComponents);
      const appModule = modules[0].default;
      await appModule.model(store);
      return getComponet(appModuleName, appViewName);
    },
  };
}

export function ssrApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: IStoreMiddleware[],
  appModuleName: string = 'stage',
  appViewName: string = 'main'
) {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw `${appModuleName} could not be found in moduleGetter`;
  }
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  return {
    store,
    async beforeRender() {
      const [{default: appModule}, ...otherModules] = await getModuleList(preloadModules);
      await appModule.model(store);
      await Promise.all(otherModules.map((module) => module.default.model(store)));
      store.dispatch = defFun;
      return getComponet(appModuleName, appViewName);
    },
  };
}
