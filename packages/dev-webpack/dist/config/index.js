"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const schema_utils_1 = require("schema-utils");
const utils_1 = __importDefault(require("./utils"));
const CluxConfigSchema = {
    type: 'object',
    additionalProperties: false,
    definitions: {
        CssLoader: { type: 'object', properties: { loader: { type: 'string' } } },
        EnvConfig: {
            type: 'object',
            additionalProperties: false,
            properties: {
                clientPublicPath: { type: 'string' },
                clientGlobalVar: { type: 'object' },
                serverGlobalVar: { type: 'object' },
                apiProxy: { type: 'object' },
            },
        },
    },
    properties: {
        type: {
            enum: ['vue', 'vue ssr', 'react', 'react ssr'],
        },
        webpackConfig: {
            instanceof: 'Function',
            description: 'Provides an custom function to transform webpackConfig: (webpackConfig) => webpackConfig',
        },
        devServerConfig: {
            instanceof: 'Function',
            description: 'Provides an custom function to transform webpack devServerConfig: (devServerConfig) => devServerConfig',
        },
        webpackPreset: {
            type: 'object',
            additionalProperties: false,
            properties: {
                urlLoaderLimitSize: {
                    type: 'number',
                    description: 'Default is 8192',
                },
                cssProcessors: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        less: {
                            anyOf: [
                                {
                                    type: 'boolean',
                                },
                                {
                                    $ref: '#/definitions/CssLoader',
                                },
                            ],
                        },
                        sass: {
                            anyOf: [
                                {
                                    type: 'boolean',
                                },
                                {
                                    $ref: '#/definitions/CssLoader',
                                },
                            ],
                        },
                        scss: {
                            anyOf: [
                                {
                                    type: 'boolean',
                                },
                                {
                                    $ref: '#/definitions/CssLoader',
                                },
                            ],
                        },
                    },
                },
            },
        },
        devServerPreset: {
            type: 'object',
            additionalProperties: false,
            properties: {
                port: {
                    type: 'number',
                    description: 'Default is 4003',
                },
            },
        },
        dir: {
            type: 'object',
            additionalProperties: false,
            properties: {
                srcPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./src',
                },
                distPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./dist',
                },
                publicPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./public',
                },
                envPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./env',
                },
            },
        },
        ui: {
            type: 'object',
            additionalProperties: false,
            properties: {
                vueWithJSX: {
                    type: 'boolean',
                    description: 'Default is false, vue renderer with templete style',
                },
            },
        },
        development: {
            $ref: '#/definitions/EnvConfig',
        },
        production: {
            $ref: '#/definitions/EnvConfig',
        },
    },
};
const rootPath = process.cwd();
const cluxConfig = fs_extra_1.default.existsSync(path_1.default.join(rootPath, 'clux.config.js')) ? require(path_1.default.join(rootPath, 'clux.config.js')) : {};
schema_utils_1.validate(CluxConfigSchema, cluxConfig, { name: '@clux/CluxConfig' });
function moduleExports(projEnvName, nodeEnv, debugMode) {
    const defaultBaseConfig = {
        type: 'react',
        dir: {
            srcPath: path_1.default.join(rootPath, './src'),
            distPath: path_1.default.join(rootPath, './dist'),
            publicPath: path_1.default.join(rootPath, './public'),
            envPath: path_1.default.join(rootPath, './env'),
        },
        ui: {
            vueWithJSX: false,
        },
        webpackPreset: {
            urlLoaderLimitSize: 8192,
            cssProcessors: { less: false, scss: false, sass: false },
        },
        webpackConfig: (config) => config,
        devServerPreset: {
            port: 4003,
        },
        devServerConfig: (config) => config,
    };
    const baseConfig = deep_extend_1.default(defaultBaseConfig, cluxConfig);
    const distPath = path_1.default.join(baseConfig.dir.distPath, projEnvName);
    const projEnvPath = path_1.default.join(baseConfig.dir.envPath, projEnvName);
    fs_extra_1.default.ensureDirSync(projEnvPath);
    const projConfig = fs_extra_1.default.existsSync(path_1.default.join(projEnvPath, 'config.js')) ? require(path_1.default.join(projEnvPath, 'config.js')) : {};
    const envConfig = deep_extend_1.default({ clientPublicPath: '/client/', apiProxy: {} }, cluxConfig[nodeEnv], projConfig[nodeEnv]);
    const { clientPublicPath, apiProxy, clientGlobalVar, serverGlobalVar } = envConfig;
    const { dir: { srcPath, publicPath }, type, ui: { vueWithJSX }, webpackPreset, webpackConfig: webpackConfigTransform, devServerConfig: devServerConfigTransform, devServerPreset: { port }, } = baseConfig;
    const useSSR = type === 'react ssr' || type === 'vue ssr';
    let vueType = '';
    if (type === 'vue' || type === 'vue ssr') {
        vueType = vueWithJSX ? 'jsx' : 'templete';
    }
    let { devServerConfig, clientWebpackConfig, serverWebpackConfig } = utils_1.default({
        debugMode,
        nodeEnv,
        rootPath,
        srcPath,
        distPath,
        publicPath,
        clientPublicPath,
        envPath: projEnvPath,
        cssProcessors: webpackPreset.cssProcessors,
        vueType,
        limitSize: webpackPreset.urlLoaderLimitSize,
        globalVar: { client: clientGlobalVar, server: serverGlobalVar },
        apiProxy,
        useSSR,
        devServerPort: port,
    });
    devServerConfig = devServerConfigTransform(devServerConfig);
    clientWebpackConfig = webpackConfigTransform(clientWebpackConfig);
    if (useSSR) {
        serverWebpackConfig = webpackConfigTransform(serverWebpackConfig);
    }
    return {
        devServerConfig,
        clientWebpackConfig,
        serverWebpackConfig,
        projectConfig: {
            rootPath,
            envName: projEnvName,
            runMode: nodeEnv,
            srcPath,
            distPath,
            publicPath,
            envPath: projEnvPath,
            debugMode: (useSSR ? `client ${clientWebpackConfig.devtool} server ${serverWebpackConfig.devtool}` : clientWebpackConfig.devtool),
            projectType: type,
            envConfig,
            vueRender: vueType,
        },
    };
}
module.exports = moduleExports;
