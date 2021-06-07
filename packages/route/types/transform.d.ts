import { CluxLocation, DeepPartial, RouteState } from './basic';
export declare function getDefaultParams(): Record<string, any>;
export interface NativeLocation {
    pathname: string;
    searchData?: Record<string, string>;
    hashData?: Record<string, string>;
}
export declare type LocationTransform = {
    in: (nativeLocation: NativeLocation | CluxLocation) => CluxLocation;
    out: (cluxLocation: CluxLocation) => NativeLocation;
};
export declare type PagenameMap<P> = Record<string, {
    argsToParams(pathArgs: Array<string | undefined>): DeepPartial<P>;
    paramsToArgs(params: DeepPartial<P>): Array<any>;
}>;
export declare type NativeLocationMap = {
    in(nativeLocation: NativeLocation): NativeLocation;
    out(nativeLocation: NativeLocation): NativeLocation;
};
export declare function assignDefaultData(data: {
    [moduleName: string]: any;
}): {
    [moduleName: string]: any;
};
export declare function dataIsNativeLocation(data: any): data is NativeLocation;
export declare function createLocationTransform(pagenameMap: PagenameMap<any>, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): LocationTransform;
export declare function nativeLocationToCluxLocation(nativeLocation: NativeLocation, locationTransform: LocationTransform): CluxLocation;
export declare function nativeUrlToNativeLocation(url: string): NativeLocation;
export declare function nativeUrlToCluxLocation(nativeUrl: string, locationTransform: LocationTransform): CluxLocation;
export declare function nativeLocationToNativeUrl({ pathname, searchData, hashData }: NativeLocation): string;
export declare function cluxLocationToNativeUrl(location: CluxLocation, locationTransform: LocationTransform): string;
export declare function cluxLocationToCluxUrl(location: CluxLocation): string;
export declare function urlToCluxLocation(url: string, locationTransform: LocationTransform): CluxLocation;
export declare function payloadToCluxLocation(payload: {
    pagename?: string;
    params?: Record<string, any>;
    extendParams?: Record<string, any> | 'current';
}, curRouteState: RouteState): CluxLocation;
