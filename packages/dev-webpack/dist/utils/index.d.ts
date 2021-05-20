interface WebpackLoader {
    loader?: string;
    options?: Record<string, any>;
    [key: string]: any;
}
export declare function genCommonOptions({ isProdModel, srcPath, isVue, limitSize, }: {
    isProdModel: boolean;
    srcPath: string;
    isVue?: boolean;
    limitSize: number;
}): {
    urlLoader: (type: string, disable: boolean, limitSize?: number | undefined) => WebpackLoader;
    oneOfTsLoader: WebpackLoader[];
    oneOfCssLoader: (extensionLoader: WebpackLoader) => WebpackLoader[];
    oneOfFileLoader: WebpackLoader[];
    forkTsCheckerWebpackPlugin: any;
};
export {};
