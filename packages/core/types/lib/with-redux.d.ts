import { Unsubscribe, StoreEnhancer, Middleware } from 'redux';
import type { BStore } from '../basic';
import type { StoreBuilder } from '../store';
export interface ReduxOptions {
    initState?: any;
    enhancers?: StoreEnhancer[];
    middlewares?: Middleware[];
}
export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function storeCreator(storeOptions: ReduxOptions): ReduxStore;
export declare function createRedux(storeOptions: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;
