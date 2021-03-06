import { Action, IModuleHandlers, CoreModuleState, CommonModule, Model, ModuleGetter, IStore } from './basic';
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
declare type Actions<T> = Pick<{
    [K in keyof T]: Handler<T[K]>;
}, {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T]>;
export interface Module<N extends string = string, H extends IModuleHandlers = IModuleHandlers, VS extends Record<string, any> = Record<string, any>> {
    default: {
        moduleName: N;
        model: Model;
        initState: H['initState'];
        views: VS;
        actions: Actions<H>;
    };
}
export declare type ExportModule<Component> = <N extends string, V extends Record<string, Component>, H extends IModuleHandlers>(moduleName: N, ModuleHandles: {
    new (): H;
}, views: V) => Module<N, H, V>['default'];
export declare const exportModule: ExportModule<any>;
export declare function cacheModule<T extends CommonModule>(module: T): () => T;
export declare function getModuleByName(moduleName: string): Promise<CommonModule> | CommonModule;
export declare function getView<T>(moduleName: string, viewName: string): T | Promise<T>;
export declare function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, controller: IStore): void | Promise<void>;
declare type ActionsThis<Ins> = {
    [K in keyof Ins]: Ins[K] extends (args: never) => any ? Handler<Ins[K]> : never;
};
export declare abstract class CoreModuleHandlers<S extends CoreModuleState = CoreModuleState, R extends Record<string, any> = {}> implements IModuleHandlers {
    readonly initState: S;
    store: IStore<R>;
    moduleName: string;
    constructor(initState: S);
    protected get actions(): ActionsThis<this>;
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: Handler<T[K]>;
    };
    protected get state(): S;
    protected get rootState(): R;
    protected getCurrentActionName(): string;
    protected get currentRootState(): R;
    protected get currentState(): S;
    protected dispatch(action: Action): void | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    Init(initState: S): S;
    Update(payload: Partial<S>, key: string): S;
    Loading(payload: Record<string, string>): S;
}
export declare function modelHotReplacement(moduleName: string, ModuleHandles: {
    new (): IModuleHandlers;
}): void;
export declare type ReturnModule<T> = T extends Promise<infer R> ? R : T;
declare type ModuleFacade<M extends CommonModule> = {
    name: string;
    views: M['default']['views'];
    state: M['default']['initState'];
    actions: M['default']['actions'];
    actionNames: {
        [K in keyof M['default']['actions']]: string;
    };
};
export declare type RootModuleFacade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleFacade<ReturnModule<ReturnType<G[K]>>>;
};
export declare type RootModuleActions<A extends RootModuleFacade> = {
    [K in keyof A]: keyof A[K]['actions'];
};
export declare type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {
    [K in keyof A]: Pick<A[K], 'name' | 'actions' | 'actionNames'>;
};
export declare type RootModuleState<A extends RootModuleFacade = RootModuleFacade> = {
    [K in keyof A]: A[K]['state'];
};
export declare function getRootModuleAPI<T extends RootModuleFacade = any>(data?: Record<string, string[]>): RootModuleAPI<T>;
export declare type BaseLoadView<A extends RootModuleFacade = {}, Options extends {
    OnLoading?: any;
    OnError?: any;
} = {
    OnLoading?: any;
    OnError?: any;
}> = <M extends keyof A, V extends keyof A[M]['views']>(moduleName: M, viewName: V, options?: Options) => A[M]['views'][V];
export {};
