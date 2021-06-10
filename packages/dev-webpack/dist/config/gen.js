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
                resolveAlias: {
                    type: 'object',
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
                proxy: { type: 'object' },
            },
        },
        mockServerPreset: {
            type: 'object',
            additionalProperties: false,
            properties: {
                port: {
                    type: 'number',
                    description: 'Default is 3003',
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
                mockPath: {
                    type: 'string',
                    description: 'Relative to the project root directory. Defalut is ./mock',
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
function moduleExports(rootPath, projEnv, nodeEnv, debugMode, devServerPort) {
    const baseCluxConfig = fs_extra_1.default.existsSync(path_1.default.join(rootPath, 'clux.config.js'))
        ? require(path_1.default.join(rootPath, 'clux.config.js'))
        : {};
    schema_utils_1.validate(CluxConfigSchema, baseCluxConfig, { name: '@clux/CluxConfig' });
    const projEnvPath = path_1.default.join(rootPath, `./env/${projEnv}`);
    fs_extra_1.default.ensureDirSync(projEnvPath);
    const envCluxConfig = fs_extra_1.default.existsSync(path_1.default.join(projEnvPath, `clux.config.js`))
        ? require(path_1.default.join(rootPath, `./env/${projEnv}/clux.config.js`))
        : {};
    schema_utils_1.validate(CluxConfigSchema, envCluxConfig, { name: '@clux/CluxConfig' });
    const defaultBaseConfig = {
        type: 'react',
        dir: {
            srcPath: './src',
            distPath: './dist',
            publicPath: './public',
            mockPath: './mock',
        },
        ui: {
            vueWithJSX: false,
        },
        webpackPreset: {
            resolveAlias: { '@': './src' },
            urlLoaderLimitSize: 8192,
            cssProcessors: { less: false, scss: false, sass: false },
        },
        webpackConfig: (config) => config,
        devServerPreset: {
            port: 4003,
            proxy: {},
        },
        devServerConfig: (config) => config,
        mockServerPreset: {
            port: 3003,
        },
        development: { clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {} },
        production: { clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {} },
    };
    const cluxConfig = deep_extend_1.default(defaultBaseConfig, baseCluxConfig, envCluxConfig);
    const nodeEnvConfig = cluxConfig[nodeEnv];
    const { clientPublicPath, clientGlobalVar, serverGlobalVar } = nodeEnvConfig;
    const { dir: { srcPath, publicPath }, type, ui: { vueWithJSX }, webpackPreset, webpackConfig: webpackConfigTransform, devServerConfig: devServerConfigTransform, devServerPreset: { port, proxy }, } = cluxConfig;
    const useSSR = type === 'react ssr' || type === 'vue ssr';
    let vueType = '';
    if (type === 'vue' || type === 'vue ssr') {
        vueType = vueWithJSX ? 'jsx' : 'templete';
    }
    const distPath = path_1.default.resolve(rootPath, cluxConfig.dir.distPath, projEnv);
    let { devServerConfig, clientWebpackConfig, serverWebpackConfig } = utils_1.default({
        debugMode,
        nodeEnv,
        rootPath,
        srcPath: path_1.default.resolve(rootPath, srcPath),
        distPath: path_1.default.resolve(rootPath, distPath),
        publicPath: path_1.default.resolve(rootPath, publicPath),
        clientPublicPath,
        envPath: projEnvPath,
        cssProcessors: webpackPreset.cssProcessors,
        vueType,
        limitSize: webpackPreset.urlLoaderLimitSize,
        globalVar: { client: clientGlobalVar, server: serverGlobalVar },
        apiProxy: proxy,
        useSSR,
        devServerPort: devServerPort || port,
        resolveAlias: webpackPreset.resolveAlias,
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
            projEnv,
            nodeEnv,
            srcPath: path_1.default.resolve(rootPath, srcPath),
            distPath: path_1.default.resolve(rootPath, distPath),
            publicPath: path_1.default.resolve(rootPath, publicPath),
            envPath: projEnvPath,
            debugMode: (useSSR ? `client ${clientWebpackConfig.devtool} server ${serverWebpackConfig.devtool}` : clientWebpackConfig.devtool),
            projectType: type,
            nodeEnvConfig,
            vueRender: vueType,
            useSSR,
        },
    };
}
module.exports = moduleExports;
