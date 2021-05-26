import type { WebpackLoader, WebpackConfig, DevServerConfig } from './utils';
interface EnvConfig {
    clientPublicPath: string;
    clientGlobalVar: Record<string, any>;
    serverGlobalVar: Record<string, any>;
    apiProxy: Record<string, {
        target: string;
    }>;
}
interface ProjConfig {
    development: EnvConfig;
    production: EnvConfig;
}
interface WebpackPreset {
    urlLoaderLimitSize: number;
    cssProcessors: {
        less: WebpackLoader | boolean;
        scss: WebpackLoader | boolean;
        sass: WebpackLoader | boolean;
    };
}
interface DevServerPreset {
    port: number;
}
interface BaseConfig {
    type: 'vue' | 'react' | 'vue ssr' | 'react ssr';
    dir: {
        srcPath: string;
        distPath: string;
        publicPath: string;
        envPath: string;
    };
    ui: {
        vueWithJSX: boolean;
    };
    webpackPreset: WebpackPreset;
    webpackConfig: (config: WebpackConfig) => WebpackConfig;
    devServerPreset: DevServerPreset;
    devServerConfig: (config: DevServerConfig) => DevServerConfig;
}
interface CluxConfig extends BaseConfig, ProjConfig {
}
interface Config {
    devServerConfig: DevServerConfig;
    clientWebpackConfig: WebpackConfig;
    serverWebpackConfig: WebpackConfig;
    projectConfig: {
        rootPath: string;
        envName: string;
        runMode: 'production' | 'development';
        srcPath: string;
        distPath: string;
        publicPath: string;
        envPath: string;
        debugMode: string;
        projectType: 'vue' | 'react' | 'vue ssr' | 'react ssr';
        envConfig: EnvConfig;
        vueRender: '' | 'templete' | 'jsx';
    };
}
declare function moduleExports(projEnvName: string, nodeEnv: 'production' | 'development', debugMode: boolean): Config;
declare namespace moduleExports {
    export { EnvConfig, ProjConfig, WebpackPreset, DevServerPreset, BaseConfig, CluxConfig, Config, WebpackLoader, WebpackConfig, DevServerConfig };
}
export = moduleExports;
