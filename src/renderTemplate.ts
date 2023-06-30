import { ComponentPool } from './ComponentPool';
import { getUIInflatorRegistry } from './InflatorRepository';

export function renderTemplate(
  template: string,
  value: any,
  rootValue: any,
  inflatorId: string,
  pool: ComponentPool,
) {
  'worklet';

  const item = pool.getComponent(template)!;
  return getUIInflatorRegistry().useMappings(
    item,
    value,
    template,
    inflatorId,
    pool,
    rootValue,
  );
}
