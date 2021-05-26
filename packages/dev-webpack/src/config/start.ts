/* eslint-disable no-console */
import * as fs from 'fs-extra';
import * as jsonFormat from 'json-format';
import * as path from 'path';
import * as WebpackDevServer from 'webpack-dev-server';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as chalk from 'chalk';
import * as webpack from 'webpack';
import * as genConfig from './index';

export function dev(projEnvName: string, debug: boolean) {
  const config = genConfig(projEnvName, 'development', debug);
  const {
    devServerConfig,
    clientWebpackConfig,
    projectConfig: {
      projectType,
      runMode,
      debugMode,
      envName,
      envConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      vueRender,
    },
  } = config;
  const envInfo = {
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
  };
  console.info(
    `projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(
      runMode
    )} debugMode: ${chalk.magenta(debugMode)}`
  );
  console.info(`EnvName: ${chalk.magenta(envName)} EnvInfo: \n${chalk.blue(jsonFormat(envInfo, {type: 'space'}))} \n`);

  const compiler = webpack(clientWebpackConfig);
  const devServer = new WebpackDevServer(compiler, devServerConfig);

  devServer.listen(devServerConfig.port, '0.0.0.0');
}
export function build(projEnvName: string, debug: boolean) {
  const config = genConfig(projEnvName, 'production', debug);
  const {
    clientWebpackConfig,
    projectConfig: {
      envPath,
      publicPath,
      distPath,
      projectType,
      runMode,
      debugMode,
      envName,
      envConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
      vueRender,
    },
  } = config;

  const envInfo = {
    clientPublicPath,
    clientGlobalVar,
    serverGlobalVar,
  };
  console.info(
    `projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(
      runMode
    )} debugMode: ${chalk.magenta(debugMode)}`
  );
  console.info(`EnvName: ${chalk.magenta(envName)} EnvInfo: \n${chalk.blue(jsonFormat(envInfo, {type: 'space'}))} \n`);

  fs.ensureDirSync(distPath);
  fs.emptyDirSync(distPath);
  fs.copySync(publicPath, distPath, {dereference: true});
  if (fs.existsSync(envPath)) {
    fs.copySync(envPath, distPath, {dereference: true});
  }

  const compiler = webpack(clientWebpackConfig);

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
