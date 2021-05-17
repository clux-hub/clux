import { Plugin, MutationPayload, SubscribeOptions } from 'vuex';
import { WatchOptions } from 'vue';
import type { BStore } from '../basic';
import type { StoreBuilder } from '../store';
export interface VuexOptions {
    initState?: any;
    plugins?: Plugin<any>[];
    devtools?: boolean;
}
export interface VuexStore extends BStore {
    subscribe<P extends MutationPayload>(fn: (mutation: P, state: any) => any, options?: SubscribeOptions): () => void;
    watch<T>(getter: (state: any, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
}
export declare function storeCreator(storeOptions: VuexOptions): VuexStore;
export declare function createVuex(storeOptions: VuexOptions): StoreBuilder<VuexOptions, VuexStore>;
