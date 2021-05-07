import { Unsubscribe, StoreEnhancer } from 'redux';
import type { BStore } from '../basic';
import type { StoreBuilder } from '../store';
export interface ReduxOptions {
    initState: any;
    enhancers: StoreEnhancer[];
}
export interface ReduxStore extends BStore {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function storeCreator(storeOptions: ReduxOptions): ReduxStore;
export declare function createRedux(storeOptions: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;
