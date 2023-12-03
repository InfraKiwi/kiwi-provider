// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ServerHookInterface begin]
export interface ServerHookInterface {
  /**
   * The condition that will trigger the hook
   */
  if?: string;

  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block ServerHookInterface end]

// [block ServerHookWithArrayInterface begin]
export type ServerHookWithArrayInterface =
  | ServerHookInterface //typeRef:ServerHookInterface:server.schema.gen.ts:false

  | ServerHookInterface[]; //typeRef:ServerHookInterface:server.schema.gen.ts:false

// [block ServerHookWithArrayInterface end]

// [block ServerListenerInterface begin]
export interface ServerListenerInterface {
  /**
   * The address to listen on
   */
  addr?:
    | '127.0.0.1'
    | string;

  /**
   * The port to listen on
   */
  port: number;
  externalUrl?: string;
}
// [block ServerListenerInterface end]

// [block ServerListenerWrapperInterface begin]
export interface ServerListenerWrapperInterface {
  listener: ServerListenerInterface; //typeRef:ServerListenerInterface:server.schema.gen.ts:false

}
// [block ServerListenerWrapperInterface end]
