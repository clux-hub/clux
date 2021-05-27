"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const deep_extend_1 = __importDefault(require("deep-extend"));
module.exports = function (rootPath, projEnv, port, mockPath) {
    const baseCluxConfig = fs_extra_1.default.existsSync(path_1.default.join(rootPath, 'clux.config.js'))
        ? require(path_1.default.join(rootPath, 'clux.config.js'))
        : {};
    const projEnvPath = path_1.default.join(rootPath, `./env/${projEnv}`);
    fs_extra_1.default.ensureDirSync(projEnvPath);
    const envCluxConfig = fs_extra_1.default.existsSync(path_1.default.join(projEnvPath, `clux.config.js`))
        ? require(path_1.default.join(rootPath, `./env/${projEnv}clux.config.js`))
        : {};
    const defaultBaseConfig = {
        dir: {
            mockPath: './mock',
        },
        mockServerPreset: {
            port: 3003,
        },
    };
    const cluxConfig = deep_extend_1.default(defaultBaseConfig, baseCluxConfig, envCluxConfig);
    return { port: port || cluxConfig.mockServerPreset.port, dir: path_1.default.resolve(rootPath, mockPath || cluxConfig.dir.mockPath) };
};
