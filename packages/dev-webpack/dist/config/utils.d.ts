interface WebpackLoader {
    loader?: string;
    options?: Record<string, any>;
    [key: string]: any;
}
interface WebpackConfig {
    name: 'client' | 'server';
    [key: string]: any;
}
interface DevServerConfig {
    port?: number;
    https?: boolean;
    host?: string;
    dev?: {
        publicPath?: string;
    };
    [key: string]: any;
}
interface ConfigOptions {
    debugMode: boolean;
    nodeEnv: 'production' | 'development';
    rootPath: string;
    srcPath: string;
    distPath: string;
    publicPath: string;
    clientPublicPath: string;
    envPath: string;
    cssProcessors: {
        less?: WebpackLoader | boolean;
        sass?: WebpackLoader | boolean;
        scss?: WebpackLoader | boolean;
    };
    limitSize: number;
    globalVar: {
        client?: any;
        server?: any;
    };
    apiProxy: {
        [key: string]: any;
    };
    useSSR: boolean;
    vueType: 'templete' | 'jsx' | '';
    devServerPort: number;
}
declare function moduleExports({ debugMode, nodeEnv, rootPath, srcPath, distPath, publicPath, clientPublicPath, envPath, cssProcessors, vueType, limitSize, globalVar, apiProxy, useSSR, devServerPort, }: ConfigOptions): {
    clientWebpackConfig: WebpackConfig;
    serverWebpackConfig: WebpackConfig;
    devServerConfig: DevServerConfig;
};
declare namespace moduleExports {
    export { ConfigOptions, WebpackLoader, WebpackConfig, DevServerConfig };
}
export = moduleExports;
