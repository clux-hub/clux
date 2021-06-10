import path from 'path';
import fs from 'fs-extra';
import deepExtend from 'deep-extend';
import {validate} from 'schema-utils';
import genConfig from './utils';
import type {WebpackLoader, WebpackConfig, DevServerConfig} from './utils';

interface EnvConfig {
  clientPublicPath: string;
  clientGlobalVar: Record<string, any>;
  serverGlobalVar: Record<string, any>;
}
interface ProjConfig {
  development: EnvConfig;
  production: EnvConfig;
}
interface WebpackPreset {
  resolveAlias: Record<string, string>;
  urlLoaderLimitSize: number;
  cssProcessors: {less: WebpackLoader | boolean; scss: WebpackLoader | boolean; sass: WebpackLoader | boolean};
}
interface DevServerPreset {
  port: number;
  proxy: Record<string, {target: string}>;
}
interface MockServerPreset {
  port: number;
}
interface BaseConfig {
  type: 'vue' | 'react' | 'vue ssr' | 'react ssr';
  dir: {
    srcPath: string;
    distPath: string;
    publicPath: string;
    mockPath: string;
  };
  ui: {
    vueWithJSX: boolean;
  };
  mockServerPreset: MockServerPreset;
  webpackPreset: WebpackPreset;
  webpackConfig: (config: WebpackConfig) => WebpackConfig;
  devServerPreset: DevServerPreset;
  devServerConfig: (config: DevServerConfig) => DevServerConfig;
}
interface CluxConfig extends BaseConfig, ProjConfig {}
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
        proxy: {type: 'object'},
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
// const rootPath = process.cwd();
// const projEnv = process.env.PROJ_ENV || 'local';
// const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
// const debugMode = !!process.env.DEBUG;
interface Config {
  devServerConfig: DevServerConfig;
  clientWebpackConfig: WebpackConfig;
  serverWebpackConfig: WebpackConfig;
  projectConfig: {
    rootPath: string;
    projEnv: string;
    nodeEnv: 'production' | 'development';
    srcPath: string;
    distPath: string;
    publicPath: string;
    envPath: string;
    debugMode: string;
    projectType: 'vue' | 'react' | 'vue ssr' | 'react ssr';
    nodeEnvConfig: EnvConfig;
    vueRender: '' | 'templete' | 'jsx';
    useSSR: boolean;
  };
}

function moduleExports(rootPath: string, projEnv: string, nodeEnv: 'production' | 'development', debugMode: boolean, devServerPort?: number): Config {
  const baseCluxConfig: Partial<CluxConfig> = fs.existsSync(path.join(rootPath, 'clux.config.js'))
    ? require(path.join(rootPath, 'clux.config.js'))
    : {};
  validate(CluxConfigSchema, baseCluxConfig, {name: '@clux/CluxConfig'});

  const projEnvPath = path.join(rootPath, `./env/${projEnv}`);
  fs.ensureDirSync(projEnvPath);
  const envCluxConfig: Partial<CluxConfig> = fs.existsSync(path.join(projEnvPath, `clux.config.js`))
    ? require(path.join(rootPath, `./env/${projEnv}/clux.config.js`))
    : {};
  validate(CluxConfigSchema, envCluxConfig, {name: '@clux/CluxConfig'});
  const defaultBaseConfig: CluxConfig = {
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
      resolveAlias: {'@': './src'},
      urlLoaderLimitSize: 8192,
      cssProcessors: {less: false, scss: false, sass: false},
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
    development: {clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {}},
    production: {clientPublicPath: '/client/', clientGlobalVar: {}, serverGlobalVar: {}},
  };
  const cluxConfig: CluxConfig = deepExtend(defaultBaseConfig, baseCluxConfig, envCluxConfig);

  const nodeEnvConfig = cluxConfig[nodeEnv];
  const {clientPublicPath, clientGlobalVar, serverGlobalVar} = nodeEnvConfig;
  const {
    dir: {srcPath, publicPath},
    type,
    ui: {vueWithJSX},
    webpackPreset,
    webpackConfig: webpackConfigTransform,
    devServerConfig: devServerConfigTransform,
    devServerPreset: {port, proxy},
  } = cluxConfig;

  const useSSR = type === 'react ssr' || type === 'vue ssr';
  let vueType: 'templete' | 'jsx' | '' = '';
  if (type === 'vue' || type === 'vue ssr') {
    vueType = vueWithJSX ? 'jsx' : 'templete';
  }

  const distPath = path.resolve(rootPath, cluxConfig.dir.distPath, projEnv);
  let {devServerConfig, clientWebpackConfig, serverWebpackConfig} = genConfig({
    debugMode,
    nodeEnv,
    rootPath,
    srcPath: path.resolve(rootPath, srcPath),
    distPath: path.resolve(rootPath, distPath),
    publicPath: path.resolve(rootPath, publicPath),
    clientPublicPath,
    envPath: projEnvPath,
    cssProcessors: webpackPreset.cssProcessors,
    vueType,
    limitSize: webpackPreset.urlLoaderLimitSize,
    globalVar: {client: clientGlobalVar, server: serverGlobalVar},
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
      srcPath: path.resolve(rootPath, srcPath),
      distPath: path.resolve(rootPath, distPath),
      publicPath: path.resolve(rootPath, publicPath),
      envPath: projEnvPath,
      debugMode: (useSSR ? `client ${clientWebpackConfig.devtool} server ${serverWebpackConfig.devtool}` : clientWebpackConfig.devtool) as string,
      projectType: type,
      nodeEnvConfig,
      vueRender: vueType,
      useSSR,
    },
  };
}

declare namespace moduleExports {
  export {EnvConfig, ProjConfig, WebpackPreset, DevServerPreset, BaseConfig, CluxConfig, Config, WebpackLoader, WebpackConfig, DevServerConfig};
}

export = moduleExports;
