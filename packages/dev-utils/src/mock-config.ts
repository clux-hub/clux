import fs from 'fs-extra';
import path from 'path';
import deepExtend from 'deep-extend';

interface MockServerPreset {
  port: number;
}
interface CluxConfig {
  dir: {
    mockPath: string;
  };
  mockServerPreset: MockServerPreset;
}
export = function (rootPath: string, projEnv: string, port?: number, mockPath?: string) {
  const baseCluxConfig: Partial<CluxConfig> = fs.existsSync(path.join(rootPath, 'clux.config.js'))
    ? require(path.join(rootPath, 'clux.config.js'))
    : {};
  const projEnvPath = path.join(rootPath, `./env/${projEnv}`);
  fs.ensureDirSync(projEnvPath);
  const envCluxConfig: Partial<CluxConfig> = fs.existsSync(path.join(projEnvPath, `clux.config.js`))
    ? require(path.join(rootPath, `./env/${projEnv}clux.config.js`))
    : {};

  const defaultBaseConfig: CluxConfig = {
    dir: {
      mockPath: './mock',
    },
    mockServerPreset: {
      port: 3003,
    },
  };
  const cluxConfig: CluxConfig = deepExtend(defaultBaseConfig, baseCluxConfig, envCluxConfig);
  return {port: port || cluxConfig.mockServerPreset.port, dir: path.resolve(rootPath, mockPath || cluxConfig.dir.mockPath)};
};
