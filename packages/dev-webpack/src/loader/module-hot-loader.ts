import * as path from 'path';

const moduleIndexFile = path.normalize('/src/modules');

export = function loader(this: any, source: string) {
  const filePath: string = this.resourcePath;
  const fileName = path.basename(filePath).split('.')[0];
  if (filePath.indexOf(moduleIndexFile) > -1 && fileName === 'index') {
    const arr = source.match(/exportModule\s*\(([^)]+)\)/m);
    const clux = source.match(/['"](@clux\/.+?)['"]/);
    if (arr && clux) {
      const args = arr[1].replace(/\s/gm, '');
      const [modelName, ModelHandlers] = args.split(',', 3);
      const views = args.replace([modelName, ModelHandlers, ''].join(','), '');
      const viewPaths = source.match(/['"]\.\/views\/.*['"]/gm) || [];
      const strs = [
        `import {modelHotReplacement, viewHotReplacement} from ${clux[0]};`,
        source,
        `if (module.hot) {
        module.hot.accept("./model", () => {
          modelHotReplacement(${[modelName, ModelHandlers].join(' , ')});
        });
        module.hot.accept([${viewPaths.toString()}], () => {
          viewHotReplacement(${[modelName, views].join(' , ')});
        });
        }`,
      ];
      return strs.join('\r\n');
    }
  }

  return source;
};
