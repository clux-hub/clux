/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
// import url from 'url';
// import defaultGateway from 'default-gateway';
import WebpackDevServer from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
import chalk from 'chalk';
import webpack, {Compiler, MultiCompiler} from 'webpack';
import genConfig from './gen';

export async function dev(projEnvName: string, debug: boolean, devServerPort: number) {
  const config = genConfig(process.cwd(), projEnvName, 'development', debug, devServerPort);
  const {
    devServerConfig,
    clientWebpackConfig,
    serverWebpackConfig,
    projectConfig: {
      projectType,
      nodeEnv,
      debugMode,
      projEnv,
      nodeEnvConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      vueRender,
      useSSR,
    },
  } = config;
  const envInfo = {
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
  };
  console.info(
    `projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(
      nodeEnv
    )} debugMode: ${chalk.magenta(debugMode)}`
  );
  console.info(`EnvName: ${chalk.magenta(projEnv)} EnvInfo: \n${chalk.blue(JSON.stringify(envInfo, null, 4))} \n`);

  let webpackCompiler: MultiCompiler | Compiler;
  if (useSSR) {
    const compiler = webpack([clientWebpackConfig, serverWebpackConfig]);
    compiler.compilers[0].hooks.failed.tap('clux-webpack dev', (msg) => {
      console.error(msg);
      process.exit(1);
    });
    compiler.compilers[1].hooks.failed.tap('clux-webpack dev', (msg) => {
      console.error(msg);
      process.exit(1);
    });
    webpackCompiler = compiler;
  } else {
    const compiler = webpack(clientWebpackConfig);
    compiler.hooks.failed.tap('clux-webpack dev', (msg) => {
      console.error(msg);
      process.exit(1);
    });
    webpackCompiler = compiler;
  }

  const protocol = devServerConfig.https ? 'https' : 'http';
  const host = devServerConfig.host || '0.0.0.0';
  const port = devServerConfig.port || 8080;
  const publicPath = devServerConfig.dev?.publicPath || '/';
  const localUrl = `${protocol}://localhost:${port}${publicPath}`;

  const devServer = new WebpackDevServer(webpackCompiler, devServerConfig);

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      devServer.close(() => {
        process.exit(0);
      });
    });
  });

  let isFirstCompile = true;
  webpackCompiler.hooks.done.tap('clux-webpack dev', (stats: any) => {
    if (stats.hasErrors()) {
      return;
    }

    if (isFirstCompile) {
      isFirstCompile = false;
      console.info(`

***************************************
*                                     *
*           ${chalk.green.bold('Welcome to Clux')}           *
*                                     *
***************************************
`);
      console.info(`.....${chalk.magenta(useSSR ? 'Enabled Server-Side Rendering!' : 'DevServer')} running at ${chalk.magenta(localUrl)}`);
    }
  });

  devServer.listen(port, host, (err: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

export function build(projEnvName: string, debug: boolean) {
  const config = genConfig(process.cwd(), projEnvName, 'production', debug);
  const {
    clientWebpackConfig,
    serverWebpackConfig,
    projectConfig: {
      envPath,
      publicPath,
      distPath,
      projectType,
      nodeEnv,
      debugMode,
      projEnv,
      nodeEnvConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      vueRender,
      useSSR,
    },
  } = config;

  const envInfo = {
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
  };
  console.info(
    `projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(
      nodeEnv
    )} debugMode: ${chalk.magenta(debugMode)}`
  );
  console.info(`EnvName: ${chalk.magenta(projEnv)} EnvInfo: \n${chalk.blue(JSON.stringify(envInfo, null, 4))} \n`);

  fs.ensureDirSync(distPath);
  fs.emptyDirSync(distPath);
  fs.copySync(publicPath, distPath, {dereference: true});
  if (fs.existsSync(envPath)) {
    fs.copySync(envPath, distPath, {dereference: true});
  }

  const webpackCompiler = useSSR ? webpack([clientWebpackConfig, serverWebpackConfig]) : webpack(clientWebpackConfig);

  webpackCompiler.run((err: any, stats: any) => {
    if (err) throw err;
    process.stdout.write(
      `${stats!.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`
    );
  });
}
export function pack(input: string, output: string, target: string) {
  let outputPath;
  let ouputName;
  if (path.extname(output)) {
    outputPath = path.dirname(output);
    ouputName = path.basename(output);
  } else {
    outputPath = output;
    ouputName = path.basename(input);
  }
  const webpackConfig: any = {
    mode: 'production',
    target,
    stats: 'minimal',
    devtool: false,
    entry: path.resolve(input),
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    output: {
      path: path.resolve(outputPath),
      filename: ouputName,
    },
    plugins: [new webpack.BannerPlugin({banner: 'eslint-disable', entryOnly: true})],
  };
  const compiler = webpack(webpackConfig);

  compiler.run((err, stats) => {
    if (err) throw err;
    process.stdout.write(
      `${stats!.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      })}\n\n`
    );
  });
}

// function prepareUrls(protocol: string, host: string, port: number, pathname = '/') {
//   const formatUrl = (hostname: string) =>
//     url.format({
//       protocol,
//       hostname,
//       port,
//       pathname,
//     });
//   const prettyPrintUrl = (hostname: string) =>
//     url.format({
//       protocol,
//       hostname,
//       port: chalk.bold(port),
//       pathname,
//     });

//   const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
//   let prettyHost;
//   let lanUrlForConfig;
//   let lanUrlForTerminal = chalk.gray('unavailable');
//   if (isUnspecifiedHost) {
//     prettyHost = 'localhost';
//     try {
//       // This can only return an IPv4 address
//       const result = defaultGateway.v4.sync();
//       lanUrlForConfig = address.ip(result && result.interface);
//       if (lanUrlForConfig) {
//         // Check if the address is a private ip
//         // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
//         if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
//           // Address is private, format it for later use
//           lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
//         } else {
//           // Address is not private, so we will discard it
//           lanUrlForConfig = undefined;
//         }
//       }
//     } catch (_e) {
//       // ignored
//     }
//   } else {
//     prettyHost = host;
//     lanUrlForConfig = host;
//     lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
//   }
//   const localUrlForTerminal = prettyPrintUrl(prettyHost);
//   const localUrlForBrowser = formatUrl(prettyHost);
//   return {
//     lanUrlForConfig,
//     lanUrlForTerminal,
//     localUrlForTerminal,
//     localUrlForBrowser,
//   };
// }
