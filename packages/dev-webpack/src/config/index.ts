import * as path from 'path';
import * as fs from 'fs-extra';
import * as deepExtend from 'deep-extend';
import {validate} from 'schema-utils';
import {genBaseConfig, WebpackLoader, WebpackConfig, DevServerConfig} from './utils';

export type {WebpackLoader, WebpackConfig, DevServerConfig} from './utils';

export interface EnvConfig {
  clientPublicPath: string;
  clientGlobalVar: Record<string, any>;
  serverGlobalVar: Record<string, any>;
  apiProxy: Record<string, {target: string}>;
}
export interface ProjConfig {
  development: EnvConfig;
  production: EnvConfig;
}
export interface WebpackPreset {
  urlLoaderLimitSize: number;
  cssProcessors: {less: WebpackLoader | boolean; scss: WebpackLoader | boolean; sass: WebpackLoader | boolean};
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
export interface CluxConfig extends BaseConfig, ProjConfig {}
const CluxConfigSchema: any = {
  type: 'object',
  additionalProperties: false,
  definitions: {
    CssLoader: {type: 'object', properties: {loader: {type: 'string'}}},
    EnvConfig: {
      type: 'object',
      additionalProperties: false,
      properties: {
        clientPublicPath: {type: 'string'},
        clientGlobalVar: {type: 'object'},
        serverGlobalVar: {type: 'object'},
        apiProxy: {type: 'object'},
      },
    },
  },
  properties: {
    type: {
      enum: ['vue', 'vue ssr', 'react', 'react ssr'],
    },
    useMock: {
      type: 'boolean',
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
const rootPath = process.cwd();
const cluxConfig: Partial<BaseConfig> = fs.existsSync(path.join(rootPath, 'clux.config.js')) ? require(path.join(rootPath, 'clux.config.js')) : {};
validate(CluxConfigSchema, cluxConfig, {name: '@clux/CluxConfig'});

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

module.exports = function (projEnvName: string, nodeEnv: 'production' | 'development', debugMode: boolean) {
  const defaultBaseConfig: BaseConfig = {
    type: 'react',
    dir: {
      srcPath: path.join(rootPath, './src'),
      distPath: path.join(rootPath, './dist'),
      publicPath: path.join(rootPath, './public'),
      envPath: path.join(rootPath, './env'),
      mockPath: path.join(rootPath, './mock'),
    },
    ui: {
      vueWithJSX: false,
    },
    useMock: true,
    webpackPreset: {
      urlLoaderLimitSize: 8192,
      cssProcessors: {less: false, scss: false, sass: false},
    },
    webpackConfig: (config) => config,
    devServerPreset: {
      port: 4003,
    },
    devServerConfig: (config) => config,
  };
  const baseConfig: BaseConfig = deepExtend(defaultBaseConfig, cluxConfig);

  const distPath = path.join(baseConfig.dir.distPath, projEnvName);
  const projEnvPath = path.join(baseConfig.dir.envPath, projEnvName);
  fs.ensureDirSync(projEnvPath);
  const projConfig: ProjConfig = fs.existsSync(path.join(projEnvPath, 'config.js')) ? require(path.join(projEnvPath, 'config.js')) : {};
  const envConfig: EnvConfig = deepExtend({clientPublicPath: '/client/', apiProxy: {}}, cluxConfig[nodeEnv], projConfig[nodeEnv]);

  const {clientPublicPath, apiProxy, clientGlobalVar, serverGlobalVar} = envConfig;
  const {
    dir: {srcPath, publicPath},
    type,
    ui: {vueWithJSX},
    webpackPreset,
    webpackConfig: webpackConfigTransform,
    devServerConfig: devServerConfigTransform,
    devServerPreset: {port},
  } = baseConfig;

  const useSSR = type === 'react ssr' || type === 'vue ssr';
  let vueType: 'templete' | 'jsx' | '' = '';
  if (type === 'vue' || type === 'vue ssr') {
    vueType = vueWithJSX ? 'jsx' : 'templete';
  }

  let {devServerConfig, clientWebpackConfig, serverWebpackConfig} = genBaseConfig({
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
    globalVar: {client: clientGlobalVar, server: serverGlobalVar},
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
      debugMode: (useSSR ? `client ${clientWebpackConfig.devtool} server ${serverWebpackConfig.devtool}` : clientWebpackConfig.devtool) as string,
      projectType: type,
      envConfig,
      vueRender: vueType,
    },
  };
};
