declare namespace cluxCore {
  interface SetTimeout {
    (callback: () => void, time: number): number;
  }
  interface ClearTimeout {
    (timer: number): void;
  }
  interface Console {
    log: (msg: string) => void;
    warn: (msg: string) => void;
    error: (error: any) => void;
  }
  interface ENV {
    isServer: boolean;
    __REDUX_DEVTOOLS_EXTENSION__?: (options: any) => any;
    __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any;
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any;
    setTimeout: SetTimeout;
    clearTimeout: ClearTimeout;
    console: Console;
  }
}
