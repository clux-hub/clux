/* eslint-disable no-await-in-loop */
import {MetaData, ModuleGetter, CommonModule, BStore, IStore} from './basic';
import {getModuleByName, loadModel} from './inject';
import {ControllerMiddleware, enhanceStore} from './store';

const defFun: any = () => undefined;

export function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preLoadModules: string[],
  moduleGetter: ModuleGetter,
  middlewares?: ControllerMiddleware[],
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
      // const appModule = await getModuleByName(appModuleName);
      // appModule.default.model(controller);
      // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
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
  middlewares?: ControllerMiddleware[],
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
// export function createApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = any, V = any>(
//   reduceOptions: <T>(options: T) => T,
//   storeCreator: (storeOptions: SO) => ST,
//   render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void,
//   ssr: (store: ST, appView: V, renderOptions: RO) => {html: string; data: any},
//   preModules: string[],
//   moduleGetter: ModuleGetter,
//   appModuleName: string = 'app',
//   appViewName: string = 'main'
// ) {
//   let options: CreateOptions<SO, RO> = {
//     moduleGetter,
//     appModuleName,
//     appViewName,
//   } as any;
//   return {
//     useStore(storeOptions: SO) {
//       options.storeOptions = storeOptions;
//       return {
//         render(renderOptions: RO) {
//           options.renderOptions = renderOptions;
//           options = reduceOptions(options);
//           MetaData.appModuleName = appModuleName;
//           MetaData.appViewName = appViewName;
//           MetaData.moduleGetter = moduleGetter;
//           const controller: IController = new Controller(storeOptions.middlewares);
//           const store = storeCreator(storeOptions);
//           store.dispatch = controller.dispatch;
//           controller.setStore(store);
//           return {
//             store,
//             async run() {
//               if (reRenderTimer) {
//                 env.clearTimeout(reRenderTimer);
//                 reRenderTimer = 0;
//               }
//               MetaData.clientController = controller;
//               const appModule = await getModuleByName(appModuleName);
//               // appModule.default.model(controller);
//               // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//               await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//               reRender = render(store, appModule.default.views[appViewName], renderOptions);
//             },
//           };
//         },
//         ssr(renderOptions: RO) {
//           options.renderOptions = renderOptions;
//           options.isSSR = true;
//           options = reduceOptions(options);
//           MetaData.appModuleName = appModuleName;
//           MetaData.appViewName = appViewName;
//           MetaData.moduleGetter = moduleGetter;
//           const controller: IController = new Controller(storeOptions.middlewares);
//           const store = storeCreator(storeOptions);
//           store.dispatch = controller.dispatch;
//           controller.setStore(store);
//           return {
//             store,
//             async run() {
//               const appModule = await getModuleByName(appModuleName);
//               // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//               // preModules.unshift(appModuleName);
//               await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//               controller.dispatch = defFun;
//               return ssr(store, appModule.default.views[appViewName], renderOptions);
//             },
//           };
//         },
//       };
//     },
//   };
// }

// export function createApp<SO extends BaseStoreOptions = BaseStoreOptions, ST extends BaseStore = BaseStore, RO = any, V = any>(
//   storeCreator: (storeOptions: SO) => {store: ST; controller: IController},
//   render: (store: ST, appView: V, renderOptions: RO) => (appView: V) => void,
//   ssr: (store: ST, appView: V, renderOptions: RO) => {html: string; data: any},
//   preModules: string[],
//   moduleGetter: ModuleGetter,
//   appModuleName: string = 'app',
//   appViewName: string = 'main'
// ): CreateApp<SO, ST, RO> {
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   return {
//     useStore(storeOptions: SO) {
//       const {store, controller} = storeCreator(storeOptions);
//       return {
//         store,
//         async ssr(renderOptions: RO) {
//           const appModule = await getModuleByName(appModuleName);
//           // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//           // preModules.unshift(appModuleName);
//           await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//           controller.dispatch = defFun;
//           return ssr(store, appModule.default.views[appViewName], renderOptions);
//         },
//         async render(renderOptions: RO) {
//           if (reRenderTimer) {
//             env.clearTimeout(reRenderTimer);
//             reRenderTimer = 0;
//           }
//           MetaData.clientController = controller;
//           const appModule = await getModuleByName(appModuleName);
//           // appModule.default.model(controller);
//           // preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//           await Promise.all(preModules.map((moduleName) => loadModel(moduleName, controller)));
//           reRender = render(store, appModule.default.views[appViewName], renderOptions);
//         },
//       };
//     },
//   };
// }

// /**
//  * ??????????????????????????????Client??????
//  * - ??????????????????????????????Module?????????Model??????????????????View?????????????????????
//  * @param render ??????View????????????????????????????????????????????????reRender????????????????????????UI
//  * @param moduleGetter ?????????????????????
//  * @param appModuleName ??????????????????????????????
//  * @param storeOptions store??????????????????StoreOptions
//  * @param startup ??????????????????static??????????????????????????????????????????
//  */
// export async function renderApp<V>(
//   render: (store: ModuleStore, appView: V) => (appView: V) => void,
//   moduleGetter: ModuleGetter,
//   appModuleOrName: string | CommonModule,
//   appViewName: string,
//   storeOptions: StoreOptions = {},
//   startup: (store: ModuleStore) => void,
//   preModules: string[]
// ): Promise<ModuleStore> {
//   if (reRenderTimer) {
//     env.clearTimeout(reRenderTimer);
//     reRenderTimer = 0;
//   }
//   const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   if (typeof appModuleOrName !== 'string') {
//     cacheModule(appModuleOrName);
//   }
//   const store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
//   startup(store);
//   const appModule = await getModuleByName(appModuleName);
//   appModule.default.model(store);
//   preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//   if (preModules.length) {
//     // SSR??????????????????module???????????????
//     await Promise.all(preModules.map((moduleName) => getModuleByName(moduleName)));
//   }
//   reRender = render(store, appModule.default.views[appViewName]);
//   return store;
// }

// /**
//  * SSR?????????????????????????????????Server??????
//  * - ??????????????????????????????Module?????????Model??????????????????View?????????????????????
//  * @param render ??????View???????????????
//  * @param moduleGetter ?????????????????????
//  * @param appModuleName ??????????????????????????????
//  * @param storeOptions store??????????????????StoreOptions
//  * @param startup ??????????????????static??????????????????????????????????????????
//  */
// export async function renderSSR<V>(
//   render: (store: ModuleStore, appView: V) => {html: any; data: any; store: ModuleStore},
//   moduleGetter: ModuleGetter,
//   appModuleOrName: string | CommonModule,
//   appViewName: string,
//   storeOptions: StoreOptions = {},
//   startup: (store: ModuleStore) => void,
//   preModules: string[]
// ) {
//   const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
//   MetaData.appModuleName = appModuleName;
//   MetaData.appViewName = appViewName;
//   MetaData.moduleGetter = moduleGetter;
//   if (typeof appModuleOrName !== 'string') {
//     cacheModule(appModuleOrName);
//   }
//   const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
//   startup(store);
//   const appModule = await getModuleByName(appModuleName);
//   preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
//   preModules.unshift(appModuleName);
//   await Promise.all(preModules.map((moduleName) => loadModel(moduleName, store)));
//   store.dispatch = defFun;
//   return render(store, appModule.default.views[appViewName]);
// }
