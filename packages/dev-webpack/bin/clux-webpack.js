#!/usr/bin/env node

/* eslint-disable no-console */
const semver = require('semver');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const fs = require('fs-extra');
const chalk = require('chalk');
const jsonFormat = require('json-format');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const {program} = require('commander');
const genConfig = require('../dist/config');
const requiredVersion = require('../package.json').engines.node;

if (!semver.satisfies(process.version, requiredVersion, {includePrerelease: true})) {
  console.error(`You are using Node ${process.version}, but vue-cli-service requires Node ${requiredVersion}.\nPlease upgrade your Node version.`);
  process.exit(1);
}

program
  .command('dev [env]')
  .description('Use a preset env configurations to start the dev server. default env is "local"')
  .option('--no-debug', 'output extra debugging')
  .option('--debug', 'output extra debugging')
  .action((env, options) => {
    env = env || 'local';
    const config = genConfig(env, 'development', !!options.debug);
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
  });

program
  .command('build [env]')
  .description('Use a preset env configurations to build the project. default env is "local"')
  .option('--debug', 'output extra debugging')
  .action((env, options) => {
    env = env || 'local';
    const config = genConfig(env, 'production', !!options.debug);
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
        `${stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        })}\n\n`
      );
    });
  });

program
  .command('pack <input> <output>')
  .description('Use webpack to package a js file')
  .option('--target <type>', "webpackConfig's target", 'es5')
  .action((input, output, options) => {
    let outputPath;
    let ouputName;
    if (path.extname(output)) {
      outputPath = path.dirname(output);
      ouputName = path.basename(output);
    } else {
      outputPath = output;
      ouputName = path.basename(input);
    }
    const webpackConfig = {
      mode: 'production',
      target: options.target,
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
        `${stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        })}\n\n`
      );
    });
  });

program.parse(process.argv);
