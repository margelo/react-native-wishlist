import { useEffect, useMemo } from 'react';
import { getUIInflatorRegistry } from './InflatorRepository';
import { generateId } from './Utils';
import { createRunInWishlistFn } from './WishlistJsRuntime';

export type TemplateValueMapper<ItemT, ValueT> = (
  item: ItemT,
  rootValue: any,
) => ValueT;

// Object cloned by reanimated are feezed so we store mutation state in a
// side map.
export type TemplateValueUIState = {
  current: any;
  dirty: boolean;
};

export type TemplateValue<ValueT> = {
  value: () => ValueT;
};

export type TemplateValueInternal<ValueT> = TemplateValue<ValueT> & {
  __isTemplateValue: boolean;
  __setDirty: () => void;
  __remove: () => void;
};

export function createTemplateValue<ValueT>(
  mapper: TemplateValueMapper<any, ValueT>,
): TemplateValueInternal<ValueT> {
  const id = generateId();

  function getOrCreateUIState() {
    'worklet';

    const registry = getUIInflatorRegistry();
    let state = registry.getTemplateValueState(id);
    if (!state) {
      state = {
        dirty: true,
        current: undefined,
      };
      registry.setTemplateValueState(id, state);
    }

    return state;
  }

  function setDirty() {
    'worklet';

    const state = getOrCreateUIState();
    state.dirty = true;
  }

  function value() {
    'worklet';

    const registry = getUIInflatorRegistry();
    const state = getOrCreateUIState();
    if (state.dirty) {
      state.current = mapper(
        registry.getCurrentValue(),
        registry.getCurrentRootValue(),
      );
      state.dirty = false;
    }

    return state.current;
  }

  function remove() {
    createRunInWishlistFn(() => {
      'worklet';

      getUIInflatorRegistry().deleteTemplateValueState(id);
    });
  }

  return {
    __isTemplateValue: true,
    __setDirty: setDirty,
    __remove: remove,
    value,
  };
}

export function isTemplateValue(
  value: unknown,
): value is TemplateValueInternal<any> {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as any).__isTemplateValue === true
  );
}

export function useTemplateValue<ItemT, ValueT>(
  mapper: TemplateValueMapper<ItemT, ValueT>,
): TemplateValue<ValueT> {
  const value = useMemo(() => {
    return createTemplateValue(mapper);
  }, [mapper]);

  useEffect(() => {
    return () => value.__remove();
  }, [value]);

  return value;
}
