import {Plugin, MutationPayload, SubscribeOptions, Mutation, Store} from 'vuex';
import {WatchOptions} from 'vue';
import type {BStore} from '../basic';
import type {StoreBuilder} from '../store';

export interface VuexOptions {
  initState?: any;
  plugins?: Plugin<any>[];
  devtools?: boolean;
}

export interface VuexStore extends BStore {
  subscribe<P extends MutationPayload>(fn: (mutation: P, state: any) => any, options?: SubscribeOptions): () => void;
  watch<T>(getter: (state: any, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
}

const mutation: Mutation<any> = () => {};

const UpdateMutationName = 'update';

export function storeCreator(storeOptions: VuexOptions): VuexStore {
  const {initState = {}, plugins, devtools = true} = storeOptions;
  const store = new Store({state: initState, mutations: {[UpdateMutationName]: mutation}, plugins, devtools});
  const vuexStore: VuexStore = store as any;
  vuexStore.getState = () => {
    return store.state;
  };
  vuexStore.update = (actionName: string, state: any, actionData: any[]) => {
    store.commit(UpdateMutationName, {actionName, actionData});
  };
  return vuexStore;
}

export function createVuex(storeOptions: VuexOptions): StoreBuilder<VuexOptions, VuexStore> {
  return {storeOptions, storeCreator};
}
