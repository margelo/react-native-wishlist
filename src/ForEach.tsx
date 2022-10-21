import { createTemplateComponent } from './createTemplateComponent';
import { ForEachBase } from './ForEachBase';
import { getUIInflatorRegistry } from './InflatorRepository';

export const ForEach = createTemplateComponent(
  ForEachBase,
  (item, props, inflatorId, pool) => {
    'worklet';

    const subItems: unknown[] = props.items;
    console.log('subItems', subItems);
    const items = subItems.map((subItem) => {
      const childItem = pool.getComponent(props.template)!;
      const childValue = subItem;
      console.log('value', childValue);
      const child = getUIInflatorRegistry().useMappings(
        childItem,
        childValue,
        props.template,
        inflatorId,
        pool,
      );
      return child;
    });

    console.log('len', items.length);

    item.setChildren(items);
  },
);