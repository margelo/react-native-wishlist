// TODO: Remove when WishList is compiled.

declare module global {
  declare var InflatorRegistry: any;
  declare var handlers: any;
  declare var handleEvent: (type: string, tag: number, payload: any) => void;
}
