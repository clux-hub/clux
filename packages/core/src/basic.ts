import {env} from './env';
import {LoadingState, TaskCounter, deepMerge, warn} from './sprite';

export const config: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DepthTimeOnLoading: number;
  ViewFlag: string;
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  ViewFlag: '__clux_is_view__',
};
/**
 * 可供设置的全局参数
 * @param _config 设置参数
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 */
export function setConfig(_config: {NSP?: string; MSP?: string; SSRKey?: string; MutableData?: boolean; DepthTimeOnLoading?: number}) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}

/**
 *
 * 因为一个action可以触发多个模块的actionHandler，priority属性用来设置handlers的优先处理顺序，通常无需设置
 */
export interface Action {
  type: string;
  /**
   * priority属性用来设置handlers的优先处理顺序，值为moduleName[]
   */
  priority?: string[];
  payload?: any[];
}

export interface ActionHandler {
  // __moduleName__: string;
  // __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  // __isHandler__?: boolean;
  __decorators__?: [
    (action: Action, moduleName: string, effectResult: Promise<any>) => any,
    null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
  ][];
  __decoratorResults__?: any[];
  (...args: any[]): any;
}
export type ActionHandlerList = Record<string, ActionHandler>;

export type ActionHandlerMap = Record<string, ActionHandlerList>;

export type ActionCreator = (...args: any[]) => Action;

export type ActionCreatorList = Record<string, ActionCreator>;

export type ActionCreatorMap = Record<string, ActionCreatorList>;

export interface IModuleHandlers {
  readonly initState: any;
  store: IStore;
}

export type Dispatch = (action: Action) => void | Promise<void>;

export type State = Record<string, Record<string, any>>;

export interface GetState<S extends State = {}> {
  (): S;
  (moduleName: string): Record<string, any> | undefined;
}
export interface BStoreOptions {
  initState?: Record<string, any>;
}

export interface BStore<S extends Record<string, any> = {}> {
  getState(): S;
  update: (actionName: string, state: S, actionData: any[]) => void;
  dispatch: (action: Action) => any;
}

export interface IStore<S extends State = {}> {
  dispatch: Dispatch;
  getState: GetState<S>;
  update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
  injectedModules: Record<string, IModuleHandlers>;
  getCurrentActionName: () => string;
  getCurrentState: GetState<S>;
}

export interface CoreModuleState {
  loading?: Record<string, LoadingState>;
}

export type Model = (store: IStore) => void | Promise<void>;

export interface CommonModule<ModuleName extends string = string> {
  default: {
    moduleName: ModuleName;
    model: Model;
    params: Record<string, any>;
    actions: Record<string, (...args: any[]) => Action>;
    components: Record<string, () => any>;
  };
}

export type ModuleGetter = Record<string, () => CommonModule | Promise<CommonModule>>;

export type FacadeMap = Record<string, {name: string; actions: ActionCreatorList; actionNames: Record<string, string>}>;

/**
 * 框架内置的几个ActionTypes
 */
export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：{moduleName}.{MLoading}
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MInit}
   */
  MInit: 'Init',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MReInit}
   */
  MReInit: 'ReInit',
  /**
   * 全局捕获到错误时使用ActionType：{Error}
   */
  Error: `clux${config.NSP}Error`,
};
export function errorAction(error: Object) {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}
export function moduleInitAction(moduleName: string, initState: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState],
  };
}
export function moduleReInitAction(moduleName: string, initState: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
    payload: [initState],
  };
}
export function moduleLoadingAction(moduleName: string, loadingState: {[group: string]: LoadingState}) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState],
  };
}
export const MetaData: {
  facadeMap: FacadeMap;
  clientStore: IStore;
  appModuleName: string;
  // appViewName: string;
  moduleGetter: ModuleGetter;
  injectedModules: Record<string, boolean>;
  reducersMap: ActionHandlerMap;
  effectsMap: ActionHandlerMap;
  moduleCaches: Record<string, CommonModule>;
  componentCaches: Record<string, any>;
} = {
  appModuleName: 'stage',
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null as any,
  clientStore: null as any,
  moduleGetter: null as any,
};

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName: string, handlers: ActionHandlerList) {
  const injectedModules = MetaData.injectedModules;
  if (injectedModules[moduleName]) {
    return;
  }
  injectedModules[moduleName] = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(config.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);
          if (arr[1]) {
            // handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
          } else {
            // handler.__isHandler__ = false;
            transformAction(
              moduleName + config.NSP + actionName,
              handler,
              moduleName,
              handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap
            );
            // addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
}

const loadings: Record<string, TaskCounter> = {};

/**
 * 手动设置Loading状态，同一个key名的loading状态将自动合并
 * - 参见LoadingState
 * @param item 一个Promise加载项
 * @param moduleName moduleName+groupName合起来作为该加载项的key
 * @param groupName moduleName+groupName合起来作为该加载项的key
 */
export function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string = 'global'): T {
  const key = moduleName + config.NSP + groupName;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(config.DepthTimeOnLoading);
    loadings[key].addListener((loadingState) => {
      const action = moduleLoadingAction(moduleName, {[groupName]: loadingState});
      store.dispatch(action);
    });
  }
  loadings[key].addItem(item);
  return item;
}

export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  // fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
/**
 * 一个类方法的装饰器，用来指示该方法为一个effectHandler
 * - effectHandler必须通过dispatch Action来触发
 * @param loadingForGroupName 注入加载状态的分组key，默认为global，如果为null表示不注入加载状态
 * @param loadingForModuleName 可将loading状态合并注入到其他module，默认为入口主模块
 *
 * ```
 * effect() == effect('global','app')
 * effect(null) 不注入加载状态
 * effect('global') == effect('global',thisModuleName)
 * ```
 */
export function effect(loadingForGroupName?: string | null, loadingForModuleName?: string) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = '';
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForGroupName) {
      const before = (curAction: Action, moduleName: string, promiseResult: Promise<any>) => {
        if (!env.isServer) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }
          setLoading(MetaData.clientStore, promiseResult, loadingForModuleName, loadingForGroupName as string);
        }
      };
      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, null]);
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}
export const mutation = reducer;
export const action = effect;
/**
 * 一个类方法的装饰器，用来向effect中注入before和after的钩子
 * - 注意不管该handler是否执行成功，前后钩子都会强制执行
 * @param before actionHandler执行前的钩子
 * @param after actionHandler执行后的钩子
 */
export function logger(
  before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}
export function deepMergeState(target: any = {}, ...args: any[]) {
  if (config.MutableData) {
    return deepMerge(target, ...args);
  }
  return deepMerge({}, target, ...args);
}

export function mergeState(target: any = {}, ...args: any[]) {
  if (config.MutableData) {
    return Object.assign(target, ...args);
  }
  return Object.assign({}, target, ...args);
}

// export function snapshotState(target: any) {
//   if (config.MutableData) {
//     return JSON.parse(JSON.stringify(target));
//   }
//   return target;
// }
