import _extends from "@babel/runtime/helpers/esm/extends";
import { compose, createStore, applyMiddleware } from 'redux';
import { env } from '../env';

var reduxReducer = function reduxReducer(state, action) {
  return _extends({}, state, action.state);
};

export function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      _storeOptions$enhance = storeOptions.enhancers,
      enhancers = _storeOptions$enhance === void 0 ? [] : _storeOptions$enhance,
      middlewares = storeOptions.middlewares;

  if (middlewares) {
    var middlewareEnhancer = applyMiddleware.apply(void 0, middlewares);
    enhancers.push(middlewareEnhancer);
  }

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose.apply(void 0, enhancers) : enhancers[0]);
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
export function createRedux(storeOptions) {
  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}