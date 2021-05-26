"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pack = exports.build = exports.dev = void 0;
const fs = require("fs-extra");
const jsonFormat = require("json-format");
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const TerserPlugin = require("terser-webpack-plugin");
const chalk = require("chalk");
const webpack = require("webpack");
const genConfig = require("./index");
function dev(projEnvName, debug) {
    const config = genConfig(projEnvName, 'development', debug);
    const { devServerConfig, clientWebpackConfig, projectConfig: { projectType, runMode, debugMode, envName, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, vueRender, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    console.info(`projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(runMode)} debugMode: ${chalk.magenta(debugMode)}`);
    console.info(`EnvName: ${chalk.magenta(envName)} EnvInfo: \n${chalk.blue(jsonFormat(envInfo, { type: 'space' }))} \n`);
    const compiler = webpack(clientWebpackConfig);
    const devServer = new WebpackDevServer(compiler, devServerConfig);
    devServer.listen(devServerConfig.port, '0.0.0.0');
}
exports.dev = dev;
function build(projEnvName, debug) {
    const config = genConfig(projEnvName, 'production', debug);
    const { clientWebpackConfig, projectConfig: { envPath, publicPath, distPath, projectType, runMode, debugMode, envName, envConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, vueRender, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    console.info(`projectType: ${chalk.magenta(projectType)}${vueRender ? ` (${chalk.green(vueRender)})` : ''} runMode: ${chalk.magenta(runMode)} debugMode: ${chalk.magenta(debugMode)}`);
    console.info(`EnvName: ${chalk.magenta(envName)} EnvInfo: \n${chalk.blue(jsonFormat(envInfo, { type: 'space' }))} \n`);
    fs.ensureDirSync(distPath);
    fs.emptyDirSync(distPath);
    fs.copySync(publicPath, distPath, { dereference: true });
    if (fs.existsSync(envPath)) {
        fs.copySync(envPath, distPath, { dereference: true });
    }
    const compiler = webpack(clientWebpackConfig);
    compiler.run((err, stats) => {
        if (err)
            throw err;
        process.stdout.write(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        })}\n\n`);
    });
}
exports.build = build;
function pack(input, output, target) {
    let outputPath;
    let ouputName;
    if (path.extname(output)) {
        outputPath = path.dirname(output);
        ouputName = path.basename(output);
    }
    else {
        outputPath = output;
        ouputName = path.basename(input);
    }
    const webpackConfig = {
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
        plugins: [new webpack.BannerPlugin({ banner: 'eslint-disable', entryOnly: true })],
    };
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
        if (err)
            throw err;
        process.stdout.write(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        })}\n\n`);
    });
}
exports.pack = pack;
