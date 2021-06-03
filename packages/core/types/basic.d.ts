import { LoadingState } from './sprite';
export declare const config: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
};
export declare function setConfig(_config: {
    NSP?: string;
    MSP?: string;
    SSRKey?: string;
    MutableData?: boolean;
    DepthTimeOnLoading?: number;
}): void;
export interface Action {
    type: string;
    priority?: string[];
    payload?: any[];
}
export interface ActionHandler {
    __isReducer__?: boolean;
    __isEffect__?: boolean;
    __decorators__?: [
        (action: Action, moduleName: string, effectResult: Promise<any>) => any,
        null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
    ][];
    __decoratorResults__?: any[];
    (...args: any[]): any;
}
export declare type ActionHandlerList = Record<string, ActionHandler>;
export declare type ActionHandlerMap = Record<string, ActionHandlerList>;
export declare type ActionCreator = (...args: any[]) => Action;
export declare type ActionCreatorList = Record<string, ActionCreator>;
export declare type ActionCreatorMap = Record<string, ActionCreatorList>;
export interface IModuleHandlers {
    initState: any;
    moduleName: string;
    store: IStore;
}
export declare type Dispatch = (action: Action) => void | Promise<void>;
export declare type State = Record<string, Record<string, any>>;
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
export declare type Model = (store: IStore) => void | Promise<void>;
export interface CommonModule<ModuleName extends string = string> {
    default: {
        moduleName: ModuleName;
        initState: Record<string, any>;
        model: Model;
        views: Record<string, any>;
        actions: Record<string, (...args: any[]) => Action>;
    };
}
export declare type ModuleGetter = Record<string, () => CommonModule | Promise<CommonModule>>;
export declare type FacadeMap = Record<string, {
    name: string;
    actions: ActionCreatorList;
    actionNames: Record<string, string>;
}>;
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MReInit: string;
    Error: string;
};
export declare const MetaData: {
    facadeMap: FacadeMap;
    clientStore: IStore;
    appModuleName: string;
    appViewName: string;
    moduleGetter: ModuleGetter;
    injectedModules: Record<string, boolean>;
    reducersMap: ActionHandlerMap;
    effectsMap: ActionHandlerMap;
};
export declare function injectActions(moduleName: string, handlers: ActionHandlerList): void;
export declare function setLoading<T extends Promise<any>>(item: T, moduleName?: string, groupName?: string): T;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => any;
export declare const mutation: typeof reducer;
export declare const action: typeof effect;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
