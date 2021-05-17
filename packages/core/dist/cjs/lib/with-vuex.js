"use strict";

exports.__esModule = true;
exports.storeCreator = storeCreator;
exports.createVuex = createVuex;

var _vuex = require("vuex");

var mutation = function mutation() {};

var UpdateMutationName = 'update';

function storeCreator(storeOptions) {
  var _mutations;

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      plugins = storeOptions.plugins,
      _storeOptions$devtool = storeOptions.devtools,
      devtools = _storeOptions$devtool === void 0 ? true : _storeOptions$devtool;
  var store = new _vuex.Store({
    state: initState,
    mutations: (_mutations = {}, _mutations[UpdateMutationName] = mutation, _mutations),
    plugins: plugins,
    devtools: devtools
  });
  var vuexStore = store;

  vuexStore.getState = function () {
    return store.state;
  };

  vuexStore.update = function (actionName, state, actionData) {
    store.commit(UpdateMutationName, {
      actionName: actionName,
      actionData: actionData
    });
  };

  return vuexStore;
}

function createVuex(storeOptions) {
  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}