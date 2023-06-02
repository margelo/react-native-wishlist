import { createTemplateComponent } from '../createTemplateComponent';
import { ForEachBase } from './ForEachBase';
import { getUIInflatorRegistry } from '../InflatorRepository';

export const ForEach = createTemplateComponent(ForEachBase, {
  addProps: (item, props, inflatorId, pool, rootValue) => {
    'worklet';

    const subItems: unknown[] = props.items;
    const items = subItems.map((subItem) => {
      const childItem = pool.getComponent(props.template)!;
      const childValue = subItem;
      const child = getUIInflatorRegistry().useMappings(
        childItem,
        childValue,
        props.template,
        inflatorId,
        pool,
        rootValue,
      );
      return child;
    });

    item.setChildren(items);
  },
});
