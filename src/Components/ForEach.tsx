import { renderTemplate } from '../renderTemplate';
import { createTemplateComponent } from '../createTemplateComponent';
import { ForEachBase } from './ForEachBase';

export const ForEach = createTemplateComponent(ForEachBase, {
  addProps: (item, props, inflatorId, pool, rootValue) => {
    'worklet';

    const subItems: unknown[] = props.items;
    const items = subItems.map((subItem) => {
      return renderTemplate(
        props.template,
        subItem,
        rootValue,
        inflatorId,
        pool,
      );
    });

    item.setChildren(items);
  },
});
