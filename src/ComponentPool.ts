import { TemplateItem } from './TemplateItem';

export type NodeType = 'View' | 'Text' | 'RawText';

export type NativeComponentPool = {
  getComponent: (id: string) => TemplateItem | undefined;
};

export type ComponentPool = NativeComponentPool & {
  createNode(type: NodeType): TemplateItem;
};

export function wrapComponentPool(pool: NativeComponentPool): ComponentPool {
  'worklet';

  return {
    getComponent: pool.getComponent,
    createNode(type) {
      switch (type) {
        case 'Text':
          return pool.getComponent('__textComponent')!.Paragraph!;
        case 'RawText':
          return pool.getComponent('__textComponent')!.Paragraph!.RawText!;
        case 'View':
          return pool.getComponent('__viewComponent')!;
        default:
          throw new Error(`Unknown node type ${type}`);
      }
    },
  };
}
