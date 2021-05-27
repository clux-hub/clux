"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pack = exports.build = exports.dev = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const chalk_1 = __importDefault(require("chalk"));
const webpack_1 = __importDefault(require("webpack"));
const gen_1 = __importDefault(require("./gen"));
function dev(projEnvName, debug, devServerPort) {
    const config = gen_1.default(process.cwd(), projEnvName, 'development', debug, devServerPort);
    const { devServerConfig, clientWebpackConfig, projectConfig: { projectType, nodeEnv, debugMode, projEnv, nodeEnvConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, vueRender, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    console.info(`projectType: ${chalk_1.default.magenta(projectType)}${vueRender ? ` (${chalk_1.default.green(vueRender)})` : ''} runMode: ${chalk_1.default.magenta(nodeEnv)} debugMode: ${chalk_1.default.magenta(debugMode)}`);
    console.info(`EnvName: ${chalk_1.default.magenta(projEnv)} EnvInfo: \n${chalk_1.default.blue(JSON.stringify(envInfo, null, 4))} \n`);
    const compiler = webpack_1.default(clientWebpackConfig);
    const devServer = new webpack_dev_server_1.default(compiler, devServerConfig);
    devServer.listen(devServerConfig.port, '0.0.0.0', (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.info(`\n \n.....starting a ${chalk_1.default.redBright('DevServer')} on ${chalk_1.default.underline.redBright(`http://localhost:${devServerConfig.port}/`)} \n`);
    });
}
exports.dev = dev;
function build(projEnvName, debug) {
    const config = gen_1.default(process.cwd(), projEnvName, 'production', debug);
    const { clientWebpackConfig, projectConfig: { envPath, publicPath, distPath, projectType, nodeEnv, debugMode, projEnv, nodeEnvConfig: { clientPublicPath, clientGlobalVar, serverGlobalVar }, vueRender, }, } = config;
    const envInfo = {
        clientPublicPath,
        clientGlobalVar,
        serverGlobalVar,
    };
    console.info(`projectType: ${chalk_1.default.magenta(projectType)}${vueRender ? ` (${chalk_1.default.green(vueRender)})` : ''} runMode: ${chalk_1.default.magenta(nodeEnv)} debugMode: ${chalk_1.default.magenta(debugMode)}`);
    console.info(`EnvName: ${chalk_1.default.magenta(projEnv)} EnvInfo: \n${chalk_1.default.blue(JSON.stringify(envInfo, null, 4))} \n`);
    fs_extra_1.default.ensureDirSync(distPath);
    fs_extra_1.default.emptyDirSync(distPath);
    fs_extra_1.default.copySync(publicPath, distPath, { dereference: true });
    if (fs_extra_1.default.existsSync(envPath)) {
        fs_extra_1.default.copySync(envPath, distPath, { dereference: true });
    }
    const compiler = webpack_1.default(clientWebpackConfig);
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
    if (path_1.default.extname(output)) {
        outputPath = path_1.default.dirname(output);
        ouputName = path_1.default.basename(output);
    }
    else {
        outputPath = output;
        ouputName = path_1.default.basename(input);
    }
    const webpackConfig = {
        mode: 'production',
        target,
        stats: 'minimal',
        devtool: false,
        entry: path_1.default.resolve(input),
        optimization: {
            minimizer: [
                new terser_webpack_plugin_1.default({
                    extractComments: false,
                }),
            ],
        },
        output: {
            path: path_1.default.resolve(outputPath),
            filename: ouputName,
        },
        plugins: [new webpack_1.default.BannerPlugin({ banner: 'eslint-disable', entryOnly: true })],
    };
    const compiler = webpack_1.default(webpackConfig);
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
