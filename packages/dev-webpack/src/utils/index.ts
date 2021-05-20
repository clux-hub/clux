const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

interface WebpackLoader {
  loader?: string;
  options?: Record<string, any>;
  [key: string]: any;
}

function getCssScopedName(srcPath: string, localName: string, mfileName: string) {
  if (mfileName.match(/[/\\]assets[/\\]css[/\\]global.module.\w+?$/)) {
    return `g-${localName}`;
  }
  mfileName = mfileName
    .replace(srcPath, '')
    .replace(/\W/g, '-')
    .replace(/^-|-index-module-\w+$|-module-\w+$|-index-vue$|-vue$/g, '')
    .replace(/^components-/, 'comp-')
    .replace(/^modules-.*?(\w+)-views(-?)(.*)/, '$1$2$3')
    .replace(/^modules-.*?(\w+)-components(-?)(.*)/, '$1-comp$2$3');
  return localName === 'root' ? mfileName : `${mfileName}_${localName}`;
}

function getUrlLoader(isProdModel: boolean, type: string, disable: boolean, limitSize: number = 2048): WebpackLoader {
  const fileLoader = {
    loader: 'file-loader',
    options: {
      name: `${type}/[name].${isProdModel ? '.[hash:8]' : ''}.[ext]`,
    },
  };
  if (disable) {
    return fileLoader;
  }
  return {
    loader: 'url-loader',
    options: {
      limitSize,
      fallback: fileLoader,
    },
  };
}

function oneOfCssLoader(isProdModel: boolean, srcPath: string, isVue: boolean, extensionLoader: WebpackLoader): WebpackLoader[] {
  // isProdModel ? [{loader: MiniCssExtractPlugin.loader}] : [{loader: 'style-loader'}]
  const styleLoader = isProdModel
    ? {loader: MiniCssExtractPlugin.loader}
    : isVue
    ? {
        loader: 'vue-style-loader',
        options: {
          sourceMap: false,
          shadowMode: false,
        },
      }
    : {
        loader: 'style-loader',
      };
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: false,
      importLoaders: 2,
    },
  };
  const cssLoaderWithModule = {
    loader: 'css-loader',
    options: {
      sourceMap: false,
      importLoaders: 2,
      modules: {
        // localIdentName: '[name]_[local]_[hash:base64:5]',
        getLocalIdent: (context: {resourcePath: string}, localIdentName: string, localName: string) => {
          return getCssScopedName(srcPath, localName, context.resourcePath);
        },
        localIdentContext: srcPath,
      },
    },
  };
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: false,
    },
  };
  const withModule = [styleLoader, cssLoaderWithModule, postcssLoader, extensionLoader].filter(Boolean);
  const withoutModule = [styleLoader, cssLoader, postcssLoader, extensionLoader].filter(Boolean);
  return isVue
    ? [
        {
          resourceQuery: /module/,
          use: withModule,
        },
        {
          resourceQuery: /\?vue/,
          use: withoutModule,
        },
        {
          test: /\.module\.\w+$/,
          use: withModule,
        },
        {use: withoutModule},
      ]
    : [
        {
          test: /\.module\.\w+$/,
          use: withModule,
        },
        {use: withoutModule},
      ];
}

function oneOfTsLoader(isProdModel: boolean, isVue: boolean): WebpackLoader[] {
  const loaders: WebpackLoader[] = [
    {
      loader: 'babel-loader',
    },
  ];
  if (isVue) {
    loaders.push({
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
        happyPackMode: false,
      },
    });
  } else {
    loaders[0].options = {
      plugins: [require.resolve('react-refresh/babel')],
    };
  }
  if (isProdModel) {
    return [{use: loaders}];
  }
  return [
    {
      test: /[/\\]src[/\\]modules[/\\].+[/\\]index\.ts$/,
      use: [...loaders, {loader: '@clux/dev-webpack/dist/loader/module-hot-loader'}],
    },
    {use: loaders},
  ];
}

export function genCommonOptions({
  isProdModel,
  srcPath,
  isVue = false,
  limitSize = 2048,
}: {
  isProdModel: boolean;
  srcPath: string;
  isVue?: boolean;
  limitSize: number;
}) {
  const tsconfigPathTest: string[] = [path.join(srcPath, 'tsconfig.json'), path.join(srcPath, '../tsconfig.json')];
  const tsconfigPath = fs.existsSync(tsconfigPathTest[0]) ? tsconfigPathTest[0] : tsconfigPathTest[1];
  return {
    urlLoader: getUrlLoader.bind(null, isProdModel),
    oneOfTsLoader: oneOfTsLoader(isProdModel, isVue),
    oneOfCssLoader: oneOfCssLoader.bind(null, isProdModel, srcPath, isVue),
    oneOfFileLoader: [
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: getUrlLoader(isProdModel, 'imgs', false, limitSize),
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: getUrlLoader(isProdModel, 'imgs', true, limitSize),
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: getUrlLoader(isProdModel, 'media', false, limitSize),
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: getUrlLoader(isProdModel, 'fonts', false, limitSize),
      },
    ] as WebpackLoader[],
    forkTsCheckerWebpackPlugin: isVue
      ? new ForkTsCheckerWebpackPlugin({
          typescript: {
            configFile: tsconfigPath,
            diagnosticOptions: {
              semantic: true,
              syntactic: false,
            },
            extensions: {vue: {enabled: true, compiler: '@vue/compiler-sfc'}},
          },
        })
      : new ForkTsCheckerWebpackPlugin({
          typescript: {
            configFile: tsconfigPath,
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        }),
  };
}
