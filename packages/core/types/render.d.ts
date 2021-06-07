import { ModuleGetter, BStore, IStore } from './basic';
import { IStoreMiddleware } from './store';
export declare function renderApp<ST extends BStore = BStore>(baseStore: ST, preloadModules: string[], preloadComponents: string[], moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string, appViewName?: string): Promise<{
    store: IStore<any> & ST;
    AppView: any;
}>;
export declare function ssrApp<ST extends BStore = BStore>(baseStore: ST, preloadModules: string[], moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string, appViewName?: string): Promise<{
    store: IStore<any> & ST;
    AppView: any;
}>;
