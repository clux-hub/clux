import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env, deepMerge, isPromise } from '@clux/core';
import { uriToLocation, nativeUrlToNativeLocation, nativeLocationToNativeUrl, History, routeConfig, setRouteConfig } from './basic';
import { testRouteChangeAction, routeChangeAction } from './module';
export { setRouteConfig, routeConfig, nativeUrlToNativeLocation } from './basic';
export { createLocationTransform } from './transform';
export { routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers } from './module';

function dataIsNativeLocation(data) {
  return data['pathname'];
}

export class BaseNativeRouter {
  constructor() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "router", null);
  }

  onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  }

  setRouter(router) {
    this.router = router;
  }

  execute(method, getNativeData, ...args) {
    return new Promise((resolve, reject) => {
      const task = {
        resolve,
        reject,
        nativeData: undefined
      };
      this.curTask = task;
      const result = this[method](() => {
        const nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }, ...args);

      if (!result) {
        resolve(undefined);
        this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(e => {
          reject(e);
          this.curTask = undefined;
        });
      }
    });
  }

}
export class BaseRouter {
  constructor(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "cluxUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "_lid", 0);

    _defineProperty(this, "listenerMap", {});

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    const location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    const key = this._createKey();

    const routeState = { ...location,
      action: 'RELAUNCH',
      key
    };
    this.routeState = routeState;
    this.cluxUrl = this.locationToCluxUrl(routeState);

    if (!routeConfig.indexUrl) {
      setRouteConfig({
        indexUrl: this.cluxUrl
      });
    }

    this._nativeData = undefined;
    this.history = new History({
      location,
      key
    });
  }

  addListener(callback) {
    this._lid++;
    const id = `${this._lid}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    const arr = Object.keys(listenerMap).map(id => listenerMap[id](data));
    return Promise.all(arr);
  }

  getRouteState() {
    return this.routeState;
  }

  getPagename() {
    return this.routeState.pagename;
  }

  getParams() {
    return this.routeState.params;
  }

  getCluxUrl() {
    return this.cluxUrl;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation,
        nativeUrl
      };
    }

    return this._nativeData.nativeUrl;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this.routeState.key;
  }

  findHistoryIndexByKey(key) {
    return this.history.findIndex(key);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  nativeUrlToNativeLocation(url) {
    return nativeUrlToNativeLocation(url);
  }

  nativeLocationToLocation(nativeLocation) {
    let location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeUrlToLocation(nativeUrl) {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
  }

  urlToLocation(url) {
    const [pathname, ...others] = url.split('?');
    const query = others.join('?');
    let location;

    try {
      if (query.startsWith('{')) {
        const data = JSON.parse(query);
        location = this.locationTransform.in({
          pagename: pathname,
          params: data
        });
      } else {
        const nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  }

  nativeLocationToNativeUrl(nativeLocation) {
    return nativeLocationToNativeUrl(nativeLocation);
  }

  locationToNativeUrl(location) {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  locationToCluxUrl(location) {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  }

  payloadToPartial(payload) {
    let params = payload.params;
    const extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pagename: payload.pagename || this.routeState.pagename,
      params: params || {}
    };
  }

  relaunch(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  }

  async _relaunch(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'RELAUNCH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('relaunch', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.cluxUrl = this.locationToCluxUrl(routeState);
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._push.bind(this, data, internal, disableNative));
  }

  async _push(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'PUSH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('push', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.cluxUrl = this.locationToCluxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  replace(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._replace.bind(this, data, internal, disableNative));
  }

  async _replace(data, internal, disableNative) {
    let location;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }

      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }

    const key = this._createKey();

    const routeState = { ...location,
      action: 'REPLACE',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('replace', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.cluxUrl = this.locationToCluxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  back(n = 1, indexUrl = 'index', internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  }

  async _back(n = 1, indexUrl, internal, disableNative) {
    const stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

    if (!stack) {
      if (indexUrl) {
        return this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative);
      }

      throw {
        code: '1',
        message: 'history not found'
      };
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = { ...location,
      action: 'BACK',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('back', () => {
        const nativeLocation = this.locationTransform.out(routeState);
        const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
        return {
          nativeLocation,
          nativeUrl
        };
      }, n, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.cluxUrl = this.locationToCluxUrl(routeState);

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.store.dispatch(routeChangeAction(routeState));
    return undefined;
  }

  taskComplete() {
    const task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  }

  executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  }

  addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  }

  destroy() {
    this.nativeRouter.destroy();
  }

}