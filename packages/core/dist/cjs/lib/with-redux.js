"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.storeCreator = storeCreator;
exports.createRedux = createRedux;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _redux = require("redux");

var _env = require("../env");

var reduxReducer = function reduxReducer(state, action) {
  return (0, _extends2.default)({}, state, action.state);
};

function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      _storeOptions$enhance = storeOptions.enhancers,
      enhancers = _storeOptions$enhance === void 0 ? [] : _storeOptions$enhance,
      middlewares = storeOptions.middlewares;

  if (middlewares) {
    var middlewareEnhancer = _redux.applyMiddleware.apply(void 0, middlewares);

    enhancers.push(middlewareEnhancer);
  }

  if (process.env.NODE_ENV === 'development' && _env.env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_env.env.__REDUX_DEVTOOLS_EXTENSION__(_env.env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = (0, _redux.createStore)(reduxReducer, initState, enhancers.length > 1 ? _redux.compose.apply(void 0, enhancers) : enhancers[0]);
  var dispatch = store.dispatch;
  var reduxStore = store;

  reduxStore.update = function (actionName, state, actionData) {
    dispatch({
      type: actionName,
      state: state,
      payload: actionData
    });
  };

  return reduxStore;
}

function createRedux(storeOptions) {
  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}