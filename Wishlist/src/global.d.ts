declare module global {
  import type {InflatorRegistryUI} from './InflatorRepository';

  declare var InflatorRegistry: InflatorRegistryUI;

  declare var handlers: any;
  declare var handleEvent: (type: string, tag: number, payload: any) => void;
}
