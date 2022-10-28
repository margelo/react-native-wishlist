import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { TemplateCallback, TemplateCallbackWorklet } from './EventHandler';
import { ForEachBase } from './ForEachBase';
import InflatorRepository, {
  ComponentPool,
  TemplateItem,
} from './InflatorRepository';
import { CaseBase } from './Switch';
import { useTemplateContext } from './TemplateContext';
import { TemplateValue, TemplateValueMapper } from './TemplateValue';
import { useWishListContext } from './WishListContext';

// This is based on types from @types/react-native createAnimatedComponent.

type Nullable = undefined | null;
type Primitive = string | number | boolean | symbol;
type Builtin = Function | Date | Error | RegExp;

interface WithTemplateArray<P> extends Array<WithTemplateValue<P>> {}
type WithTemplateObject<T> = {
  [K in keyof T]: WithTemplateValue<T[K]>;
};

type WithTemplateValue<T> = T extends Builtin | Nullable
  ? T
  : T extends Primitive
  ? T | TemplateValue<T>
  : T extends Array<infer P>
  ? WithTemplateArray<P>
  : T extends {}
  ? WithTemplateObject<T>
  : T;

type NonTemplateProps = 'key' | 'ref';

export type TemplateProps<T> = {
  [key in keyof T]: key extends NonTemplateProps
    ? T[key]
    : WithTemplateValue<T[key]>;
};

export interface TemplateComponent<T extends React.ComponentType<any>>
  extends React.FC<TemplateProps<React.ComponentPropsWithRef<T>>> {}

let nativeIdGenerator = 0;

function setInObject(obj: any, path: string[], value: any) {
  'worklet';

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = current[path[i]] ?? {};
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}

function traverseObject(
  obj: any,
  callback: (path: string[], value: any) => void,
) {
  const stack: { path: string[]; value: any }[] = [{ path: [], value: obj }];
  while (stack.length > 0) {
    const { path, value } = stack.pop()!;

    if (
      value &&
      typeof value === 'object' &&
      !(value instanceof TemplateValue) &&
      !(value instanceof TemplateCallback) &&
      (path.length === 0 || path[path.length - 1] !== 'children')
    ) {
      Object.keys(value).forEach((key) => {
        stack.push({ path: [...path, key], value: value[key] });
      });
    } else {
      callback(path, value);
    }
  }
}

function convertToTemplateValue(value: unknown, path: string[]) {
  let curTemplateType = value;

  return {
    mapper: () => {
      'worklet';
      return curTemplateType;
    },
    targetPath: path,
  };
}

export function createTemplateComponent<T extends React.ComponentType<any>>(
  Component: T,
  addProps?: (
    templateItem: TemplateItem,
    props: any,
    inflatorId: string,
    pool: ComponentPool,
    rootValue: any,
  ) => void,
): TemplateComponent<T> {
  const WishListComponent = forwardRef<any, any>(({ style, ...props }, ref) => {
    const { inflatorId } = useWishListContext();
    const { templateType } = useTemplateContext();

    const nativeId = useMemo(() => `template_id_${nativeIdGenerator++}`, []);

    const otherPropsMemoized = useMemo(() => {
      const resolvedStyle = StyleSheet.flatten(style);

      const templateValues: {
        mapper: TemplateValueMapper<any, any>;
        targetPath: string[];
      }[] = [];

      const templateCallbacks: {
        worklet: TemplateCallbackWorklet;
        eventName: string;
      }[] = [];

      const otherProps = {};
      traverseObject({ ...props, style: resolvedStyle }, (path, value) => {
        const applyHacks = () => {
          // Text component needs to receive a string child to work properly.
          // @ts-expect-error TODO: fix this.
          if (path[0] === 'children' && Component === Text) {
            setInObject(otherProps, path, ' ');
          }
        };

        if (value instanceof TemplateValue) {
          templateValues.push({ mapper: value.getMapper(), targetPath: path });

          applyHacks();
        } else if (value instanceof TemplateCallback) {
          templateCallbacks.push({
            worklet: value.getWorklet(),
            // Callbacks should never be in objects.
            eventName: path[0].replace(/^on/, 'top'),
          });
        } else {
          // @ts-expect-error TODO: fix this.
          if (Component === ForEachBase && path[0] === 'template') {
            templateValues.push(convertToTemplateValue(value, path));
          }

          if (
            // @ts-expect-error TODO: fix this.
            Component === CaseBase &&
            path[0] === 'value' &&
            !(value instanceof TemplateValue)
          ) {
            templateValues.push(convertToTemplateValue(value, path));
          }

          setInObject(otherProps, path, value);
        }
      });
      InflatorRepository.registerMapping(
        inflatorId,
        nativeId,
        templateType,
        (value, templateItem, pool, rootValue) => {
          'worklet';

          const propsToSet: any = {};
          for (const { mapper, targetPath } of templateValues) {
            setInObject(propsToSet, targetPath, mapper(value, rootValue));
          }

          for (const { worklet, eventName } of templateCallbacks) {
            templateItem?.setCallback(eventName, () => {
              worklet(value, rootValue);
            });
          }

          // Styles need to be passed as props.
          const { style: styleForProps, ...otherPropsToSet } = propsToSet;
          const finalPropsToSet = { ...otherPropsToSet, ...styleForProps };
          if (addProps) {
            addProps(
              templateItem,
              finalPropsToSet,
              inflatorId,
              pool,
              rootValue,
            );
          } else {
            templateItem.addProps(finalPropsToSet);
          }
        },
      );
      return otherProps;
      // TODO: This will change on every render, if we want this memo to work properly we need
      // to shallow compare the props object.
    }, [inflatorId, nativeId, props, style, templateType]);

    // @ts-expect-error: this is ok.
    return <Component {...otherPropsMemoized} ref={ref} nativeID={nativeId} />;
  }) as unknown as TemplateComponent<T>;

  WishListComponent.displayName = `WishList(${Component.displayName})`;

  return WishListComponent;
}
