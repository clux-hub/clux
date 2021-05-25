import { WebpackLoader, WebpackConfig, DevServerConfig } from './utils';
export type { WebpackLoader, WebpackConfig, DevServerConfig } from './utils';
export interface EnvConfig {
    clientPublicPath: string;
    clientGlobalVar: Record<string, any>;
    serverGlobalVar: Record<string, any>;
    apiProxy: Record<string, {
        target: string;
    }>;
}
export interface ProjConfig {
    development: EnvConfig;
    production: EnvConfig;
}
export interface WebpackPreset {
    urlLoaderLimitSize: number;
    cssProcessors: {
        less: WebpackLoader | boolean;
        scss: WebpackLoader | boolean;
        sass: WebpackLoader | boolean;
    };
}
export interface DevServerPreset {
    port: number;
}
export interface BaseConfig {
    type: 'vue' | 'react' | 'vue ssr' | 'react ssr';
    dir: {
        srcPath: string;
        distPath: string;
        publicPath: string;
        envPath: string;
        mockPath: string;
    };
    ui: {
        vueWithJSX: boolean;
    };
    useMock: boolean;
    webpackPreset: WebpackPreset;
    webpackConfig: (config: WebpackConfig) => WebpackConfig;
    devServerPreset: DevServerPreset;
    devServerConfig: (config: DevServerConfig) => DevServerConfig;
}
export interface CluxConfig extends BaseConfig, ProjConfig {
}
export interface Config {
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
export interface GenConfig {
    (projEnvName: string, nodeEnv: 'production' | 'development', debugMode: boolean): Config;
}
