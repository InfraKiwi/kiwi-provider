// Generated with: yarn gen -> cmd/schemaGen.ts

/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface NotifierHTTPInterface {
  auth?: {
    password: string;
    username: string;
  };
  baseURL?: string;
  data?: any[] | {
    [x: string]: any;
  };
  filters?: {
    jsonPath?: string;
  };
  headers?: {
    [x: string]: any;
  };
  log?: {
    default?: {
      data?: boolean;
      headers?: boolean;
      params?: boolean;
    };
    error?: {
      data?: boolean;
      headers?: boolean;
      params?: boolean;
    };
    request?: {
      data?: boolean;
      headers?: boolean;
      params?: boolean;
    };
    response?: {
      data?: boolean;
      headers?: boolean;
      params?: boolean;
    };
  };
  maxBodyLength?: number;
  maxContentLength?: number;
  maxRedirects?: 5 | number;
  method?: "get" | 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'purge' | 'link' | 'unlink';
  params?: {
    [x: string]: any;
  };
  proxy?: false | {
    auth?: {
      password: string;
      username: string;
    };
    host: string;
    port: number;
    protocol?: "http" | 'http' | 'https';
  };
  responseEncoding?: "utf8" | string;
  responseType?: "json" | 'json' | 'text';
  socketPath?: string;
  timeout?: number;
  url?: string;
  validStatus?: number[] | string;
}
export type NotifierHTTPInterfaceConfigKey = "http";
export const NotifierHTTPInterfaceConfigKeyFirst = "http";
