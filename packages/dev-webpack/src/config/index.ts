/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import TerserPlugin from 'terser-webpack-plugin';
import chalk from 'chalk';
import webpack from 'webpack';
import genConfig from './gen';

export function dev(projEnvName: string, debug: boolean, devServerPort: number) {
  const config = genConfig(process.cwd(), projEnvName, 'development', debug, devServerPort);
  const {
    devServerConfig,
    clientWebpackConfig,
    projectConfig: {
      projectType,
      nodeEnv,
      debugMode,
      projEnv,
      nodeEnvConfig: {clientPublicPath, clientGlobalVar, serverGlobalVar},
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
      nodeEnv
    )} debugMode: ${chalk.magenta(debugMode)}`
  );
  console.info(`EnvName: ${chalk.magenta(projEnv)} EnvInfo: \n${chalk.blue(JSON.stringify(envInfo, null, 4))} \n`);

  const compiler = webpack(clientWebpackConfig);
  const devServer = new WebpackDevServer(compiler, devServerConfig);

  devServer.listen(devServerConfig.port, '0.0.0.0', (err: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.info(
      `\n \n.....starting a ${chalk.redBright('DevServer')} on ${chalk.underline.redBright(`http://localhost:${devServerConfig.port}/`)} \n`
    );
  });
}
export function build(projEnvName: string, debug: boolean) {
  const config = genConfig(process.cwd(), projEnvName, 'production', debug);
  const {
    clientWebpackConfig,
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
