/* eslint-disable import/order */
import './env';
import {routeMiddleware, setRouteConfig, routeConfig} from '@clux/route';
import {env, getRootModuleAPI, renderApp, ssrApp, setConfig as setCoreConfig, exportModule as baseExportModule} from '@clux/core';
import {createRouter} from '@clux/route-browser';
import {createApp as createVue} from 'vue';
import {loadView, setLoadViewOptions} from './loadView';
import {MetaData} from './sington';
import type {Component} from 'vue';
import type {
  ModuleGetter,
  ExportModule,
  ControllerMiddleware,
  StoreBuilder,
  BStoreOptions,
  BStore,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
} from '@clux/core';
import type {RouteModule} from '@clux/route';
import type {IRouter} from '@clux/route-browser';
import type {LoadView} from './loadView';

export {createVuex} from '@clux/core/lib/with-vuex';
export {
  ActionTypes,
  LoadingState,
  modelHotReplacement,
  env,
  effect,
  errorAction,
  reducer,
  setLoading,
  logger,
  isServer,
  serverSide,
  clientSide,
  deepMerge,
  deepMergeState,
  isProcessedError,
  setProcessedError,
  delayPromise,
} from '@clux/core';
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@clux/route';

export type {RootModuleFacade as Facade, Dispatch, CoreModuleState as BaseModuleState} from '@clux/core';
export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@clux/route';
export type {VuexStore, VuexOptions} from '@clux/core/lib/with-vuex';
export type {LoadView} from './loadView';

let SSRTPL: string;

export function setSsrHtmlTpl(tpl: string) {
  SSRTPL = tpl;
}

export function setConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: Record<string, string>;
  NSP?: string;
  MSP?: string;
  MutableData?: boolean;
  DepthTimeOnLoading?: number;
  LoadViewOnError?: Component;
  LoadViewOnLoading?: Component;
  disableNativeRoute?: boolean;
}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}

export const exportModule: ExportModule<Component> = baseExportModule;

export interface RenderOptions {
  id?: string;
  ssrKey?: string;
}
export interface SSROptions {
  id?: string;
  ssrKey?: string;
  url: string;
}

export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

export type GetAPP<A extends RootModuleFacade> = {
  State: {[M in keyof A]: A[M]['state']};
  GetRouter: () => IRouter<A['route']['state']['params'], Extract<keyof A['route']['views'], string>>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadView: LoadView<A>;
  Modules: RootModuleAPI<A>;
  Actions: RootModuleActions<A>;
  Pagenames: {[K in keyof A['route']['views']]: K};
};

export function getApp<T extends {GetActions: any; GetRouter: any; LoadView: any; Modules: any; Pagenames: any}>(): Pick<
  T,
  'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'
> {
  const modules = getRootModuleAPI();
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: () => MetaData.router,
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames,
  };
}

declare const process: any;

export function createApp(moduleGetter: ModuleGetter, middlewares: ControllerMiddleware[] = [], appModuleName?: string, appViewName?: string) {
  const controllerMiddleware = [routeMiddleware, ...middlewares];
  const {locationTransform} = moduleGetter['route']() as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return {
        render({id = 'root', ssrKey = 'cluxInitStore'}: RenderOptions = {}) {
          const router = createRouter('Browser', locationTransform);
          const routeState = router.getRouteState();
          const ssrData = env[ssrKey];
          // const renderFun = ssrData ? hydrate : render;
          // const panel = env.document.getElementById(id);
          const initState = {...storeOptions.initState, route: routeState, ...ssrData};
          const baseStore = storeCreator({...storeOptions, initState});
          const {store, beforeRender} = renderApp(baseStore, Object.keys(initState), moduleGetter, controllerMiddleware, appModuleName, appViewName);
          router.setStore(store);
          MetaData.router = router;
          return {
            store,
            run() {
              return beforeRender().then((AppView: Component) => {
                const app = createVue(AppView)
                  .use(store as any)
                  .mount(`#${id}`);
                if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                  env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
                }
              });
            },
          };
        },
        ssr({id = 'root', ssrKey = 'cluxInitStore', url}: SSROptions) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.CLUX_ENV_SSRTPL');
          }
          const router = createRouter(url, locationTransform);
          const routeState = router.getRouteState();
          const initState = {...storeOptions.initState, route: routeState};
          const baseStore = storeCreator({...storeOptions, initState});
          const {store, beforeRender} = ssrApp(
            baseStore,
            Object.keys(routeState.params),
            moduleGetter,
            controllerMiddleware,
            appModuleName,
            appViewName
          );
          router.setStore(store);
          MetaData.router = router;
          return {
            store,
            run() {
              return beforeRender().then((AppView: Component) => {
                const data = store.getState();
                let html: string = '';

                const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
                if (match) {
                  const pageHead = html.split(/<head>|<\/head>/, 3);
                  html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                  return SSRTPL.replace(
                    '</head>',
                    `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify(data)};</script>\r\n</head>`
                  ).replace(match[0], match[0] + html);
                }
                return html;
              });
            },
          };
        },
      };
    },
  };
}
