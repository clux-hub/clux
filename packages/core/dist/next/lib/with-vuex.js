import { Store } from 'vuex';

const mutation = () => {};

const UpdateMutationName = 'update';
export function storeCreator(storeOptions) {
  const {
    initState = {},
    plugins,
    devtools = true
  } = storeOptions;
  const store = new Store({
    state: initState,
    mutations: {
      [UpdateMutationName]: mutation
    },
    plugins,
    devtools
  });
  const vuexStore = store;

  vuexStore.getState = () => {
    return store.state;
  };

  vuexStore.update = (actionName, state, actionData) => {
    store.commit(UpdateMutationName, {
      actionName,
      actionData
    });
  };

  return vuexStore;
}
export function createVuex(storeOptions) {
  return {
    storeOptions,
    storeCreator
  };
}