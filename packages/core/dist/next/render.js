import { MetaData } from './basic';
import { getModuleList, getComponentList, getComponet } from './inject';
import { enhanceStore } from './store';

const defFun = () => undefined;

export async function renderApp(baseStore, preloadModules, preloadComponents, moduleGetter, middlewares, appModuleName = 'stage', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw `${appModuleName} could not be found in moduleGetter`;
  }

  preloadModules = preloadModules.filter(moduleName => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares);
  MetaData.clientStore = store;
  const modules = await getModuleList(preloadModules);
  await getComponentList(preloadComponents);
  const appModule = modules[0].default;
  await appModule.model(store);
  const AppView = getComponet(appModuleName, appViewName);
  return {
    store,
    AppView
  };
}
export async function ssrApp(baseStore, preloadModules, moduleGetter, middlewares, appModuleName = 'stage', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw `${appModuleName} could not be found in moduleGetter`;
  }

  preloadModules = preloadModules.filter(moduleName => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares);
  const [{
    default: appModule
  }, ...otherModules] = await getModuleList(preloadModules);
  await appModule.model(store);
  await Promise.all(otherModules.map(module => module.default.model(store)));
  store.dispatch = defFun;
  const AppView = getComponet(appModuleName, appViewName);
  return {
    store,
    AppView
  };
}