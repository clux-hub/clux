import './env';
import type { ComponentType } from 'react';
import type { ModuleGetter, ExportModule, ControllerMiddleware, StoreBuilder, BStoreOptions, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@clux/core';
import type { IRouter } from '@clux/route-browser';
import type { LoadView } from './loadView';
export type { RootModuleFacade as Facade, Dispatch, CoreModuleState as BaseModuleState } from '@clux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@clux/route';
export type { LoadView } from './loadView';
export type { ConnectRedux } from './lib/with-redux';
export type { ReduxStore, ReduxOptions } from '@clux/core/lib/with-redux';
export { ActionTypes, LoadingState, modelHotReplacement, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, isProcessedError, setProcessedError, delayPromise, } from '@clux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@clux/route';
export { DocumentHead } from './components/DocumentHead';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export { Link } from './components/Link';
export { connectRedux, createRedux, Provider } from './lib/with-redux';
export declare function setSsrHtmlTpl(tpl: string): void;
export declare function setConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: Record<string, string>;
    NSP?: string;
    MSP?: string;
    MutableData?: boolean;
    DepthTimeOnLoading?: number;
    LoadViewOnError?: ComponentType<{
        message: string;
    }>;
    LoadViewOnLoading?: ComponentType<{}>;
    disableNativeRoute?: boolean;
}): void;
export declare const exportModule: ExportModule<ComponentType<any>>;
export interface RenderOptions {
    id?: string;
    ssrKey?: string;
}
export interface SSROptions {
    id?: string;
    ssrKey?: string;
    url: string;
}
export declare function createApp(moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({ storeOptions, storeCreator }: StoreBuilder<O, B>): {
        render({ id, ssrKey }?: RenderOptions): {
            store: import("@clux/core").IStore<any> & B;
            run(): Promise<void>;
        };
        ssr({ id, ssrKey, url }: SSROptions): {
            store: import("@clux/core").IStore<any> & B;
            run(): Promise<string>;
        };
    };
};
export declare function patchActions(typeName: string, json?: string): void;
export declare type GetAPP<A extends RootModuleFacade> = {
    State: {
        [M in keyof A]: A[M]['state'];
    };
    GetRouter: () => IRouter<A['route']['state']['params'], A['route']['viewName']>;
    GetActions<N extends keyof A>(...args: N[]): {
        [K in N]: A[K]['actions'];
    };
    LoadView: LoadView<A>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in A['route']['viewName']]: K;
    };
};
export declare function getApp<T extends {
    GetActions: any;
    GetRouter: any;
    LoadView: any;
    Modules: any;
    Pagenames: any;
}>(): Pick<T, 'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'>;
