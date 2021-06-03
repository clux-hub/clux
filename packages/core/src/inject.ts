import {env} from './env';
import {isPromise} from './sprite';
import {
  Action,
  IModuleHandlers,
  ActionHandlerMap,
  injectActions,
  CoreModuleState,
  CommonModule,
  MetaData,
  Model,
  ModuleGetter,
  IStore,
  FacadeMap,
  config,
  reducer,
  mergeState,
  moduleInitAction,
  moduleReInitAction,
} from './basic';

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;

type Actions<T> = Pick<
  {[K in keyof T]: Handler<T[K]>},
  {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T]
>;

export interface Module<
  N extends string = string,
  H extends IModuleHandlers = IModuleHandlers,
  VS extends Record<string, any> = Record<string, any>
> {
  default: {
    /**
     * 模块名称
     */
    moduleName: N;
    model: Model;
    initState: H['initState'];
    /**
     * 模块供外部使用的views
     */
    views: VS;
    /**
     * 模块可供调用的actionCreator
     */
    actions: Actions<H>;
  };
}

/**
 * 导出Module
 * @param ModuleHandles 模块的ModuleHandlers类，必须继承BaseModuleHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 */
export type ExportModule<Component> = <N extends string, V extends Record<string, Component>, H extends IModuleHandlers>(
  moduleName: N,
  ModuleHandles: {
    new (): H;
  },
  views: V
) => Module<N, H, V>['default'];

/**
 * 导出Module，该方法为ExportModule接口的实现
 * @param ModuleHandles 模块的ModuleHandlers类，必须继承CoreModuleHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 */
export const exportModule: ExportModule<any> = (moduleName, ModuleHandles, views) => {
  const model: Model = (store) => {
    if (!store.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles();
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      injectActions(moduleName, moduleHandles as any);
      const initState = moduleHandles.initState;
      const preModuleState = store.getState(moduleName);
      if (preModuleState) {
        return store.dispatch(moduleReInitAction(moduleName, initState));
      }
      return store.dispatch(moduleInitAction(moduleName, initState));
    }
    return undefined;
  };
  return {
    moduleName,
    model,
    views,
    initState: undefined as any,
    actions: undefined as any,
  };
};

export function cacheModule<T extends CommonModule>(module: T): () => T {
  const moduleName = module.default.moduleName;
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  let fn = moduleGetter[moduleName] as any;
  if (fn.__module__ === module) {
    return fn;
  }
  fn = () => module;
  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}

export function getModuleByName(moduleName: string): Promise<CommonModule> | CommonModule {
  const result = MetaData.moduleGetter[moduleName]();
  if (isPromise(result)) {
    return result.then((module) => {
      cacheModule(module);
      return module as Module;
    });
  }
  cacheModule(result);
  return result as Module;
}

/**
 * 动态获取View，与LoadView的区别是：
 * - getView仅获取view，并不渲染，与UI平台无关
 * - LoadView内部会调用getView之后会渲染View
 * - getView会自动加载并初始化该view对应的model
 */
export function getView<T>(moduleName: string, viewName: string): T | Promise<T> {
  const callback = (module: CommonModule) => {
    const view: T = module.default.views[viewName];
    if (env.isServer) {
      return view;
    }
    module.default.model(MetaData.clientStore);
    return view;
  };
  const moduleOrPromise = getModuleByName(moduleName);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }
  return callback(moduleOrPromise);
}

/**
 * 动态加载并初始化其他模块的model
 */
export function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: IStore): void | Promise<void> {
  const moduleOrPromise = getModuleByName(moduleName as string);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then((module) => module.default.model(store));
  }
  return moduleOrPromise.default.model(store);
}

type ActionsThis<Ins> = {
  [K in keyof Ins]: Ins[K] extends (args: never) => any ? Handler<Ins[K]> : never;
};

/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 */
export abstract class CoreModuleHandlers<S extends CoreModuleState = CoreModuleState, R extends Record<string, any> = {}> implements IModuleHandlers {
  store!: IStore<R>;

  moduleName: string = '';

  constructor(public readonly initState: S) {}

  protected get actions(): ActionsThis<this> {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: Handler<T[K]>} {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  /**
   * 获取本Model的state
   */
  protected get state(): S {
    return this.store.getState(this.moduleName) as S;
  }

  /**
   * 获取整个store的state
   */
  protected get rootState(): R {
    return this.store.getState() as R;
  }

  protected getCurrentActionName(): string {
    return this.store.getCurrentActionName();
  }

  protected get currentRootState(): R {
    return this.store.getCurrentState();
  }

  protected get currentState(): S {
    return this.store.getCurrentState(this.moduleName) as S;
  }

  protected dispatch(action: Action) {
    return this.store.dispatch(action);
  }

  /**
   * 动态加载并初始化其他模块的model
   */
  protected loadModel(moduleName: string) {
    return loadModel(moduleName, this.store);
  }

  /**
   * - 模块被加载并初始化时将触发‘moduleName.Init’的action
   * - 此方法为该action的默认reducerHandler，通常用来注入初始化moduleState
   */
  @reducer
  public Init(initState: S): S {
    return initState;
  }

  /**
   * 通用的reducerHandler，通常用来更新moduleState
   */
  @reducer
  public Update(payload: Partial<S>, key: string): S {
    return mergeState(this.state, payload);
  }

  /**
   * - effect异步执行时，将自动派发‘moduleName.Loading’的action
   * - 此方法为该action的默认reducerHandler，通常用来在moduleState中注入loading状态
   */
  @reducer
  public Loading(payload: Record<string, string>): S {
    const loading = mergeState(this.state.loading, payload);
    return mergeState(this.state, {loading});
    // const state = this.state;
    // return {
    //   ...state,
    //   loading: {...state.loading, ...payload},
    // };
  }
}

function clearHandlers(moduleName: string, actionHandlerMap: ActionHandlerMap) {
  // eslint-disable-next-line no-restricted-syntax
  for (const actionName in actionHandlerMap) {
    // eslint-disable-next-line no-prototype-builtins
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[moduleName];
    }
  }
}

/**
 * 当model发生变化时，用来热更新model
 * - 注意通常initState发生变更时不确保热更新100%有效，此时会console警告
 * - 通常actionHandlers发生变更时热更新有效
 */
export function modelHotReplacement(
  moduleName: string,
  ModuleHandles: {
    new (): IModuleHandlers;
  }
) {
  const store = MetaData.clientStore;
  if (store.injectedModules[moduleName]) {
    clearHandlers(moduleName, MetaData.reducersMap);
    clearHandlers(moduleName, MetaData.effectsMap);
    const moduleHandles = new ModuleHandles();
    store.injectedModules[moduleName] = moduleHandles;
    moduleHandles.moduleName = moduleName;
    moduleHandles.store = store;
    injectActions(moduleName, moduleHandles as any);
    env.console.log(`[HMR] @clux Updated model: ${moduleName}`);
  }
}

export type ReturnModule<T> = T extends Promise<infer R> ? R : T;

type ModuleFacade<M extends CommonModule> = {
  name: string;
  views: M['default']['views'];
  state: M['default']['initState'];
  actions: M['default']['actions'];
  actionNames: {[K in keyof M['default']['actions']]: string};
};

export type RootModuleFacade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleFacade<ReturnModule<ReturnType<G[K]>>>};

export type RootModuleActions<A extends RootModuleFacade> = {[K in keyof A]: keyof A[K]['actions']};

export type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {[K in keyof A]: Pick<A[K], 'name' | 'actions' | 'actionNames'>};

export type RootModuleState<A extends RootModuleFacade = RootModuleFacade> = {[K in keyof A]: A[K]['state']};

export function getRootModuleAPI<T extends RootModuleFacade = any>(data?: Record<string, string[]>): RootModuleAPI<T> {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions: Record<string, any> = {};
        const actionNames: Record<string, string> = {};
        arr.forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as FacadeMap);
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy(
        {},
        {
          set(target, moduleName: string, val, receiver) {
            return Reflect.set(target, moduleName, val, receiver);
          },
          get(target, moduleName: string, receiver) {
            const val = Reflect.get(target, moduleName, receiver);
            if (val !== undefined) {
              return val;
            }
            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
                actionNames: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return moduleName + config.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
                    },
                  }
                ),
              };
            }
            return cacheData[moduleName];
          },
        }
      );
    }
  }
  return MetaData.facadeMap as any;
}

export type BaseLoadView<A extends RootModuleFacade = {}, Options extends {OnLoading?: any; OnError?: any} = {OnLoading?: any; OnError?: any}> = <
  M extends keyof A,
  V extends keyof A[M]['views']
>(
  moduleName: M,
  viewName: V,
  options?: Options
) => A[M]['views'][V];
