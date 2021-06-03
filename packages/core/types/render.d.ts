import { ModuleGetter, BStore, IStore } from './basic';
import { IStoreMiddleware } from './store';
export declare function renderApp<ST extends BStore = BStore>(baseStore: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string, appViewName?: string): {
    store: IStore<any> & ST;
    beforeRender(): Promise<any>;
};
export declare function ssrApp<ST extends BStore = BStore>(baseStore: ST, preLoadModules: string[], moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string, appViewName?: string): {
    store: IStore<any> & ST;
    beforeRender(): Promise<any>;
};
