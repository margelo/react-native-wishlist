import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { TemplateCallback, TemplateCallbackWorklet } from './EventHandler';
import { ForEachBase } from './Components/ForEachBase';
import InflatorRepository, {
  ComponentPool,
  TemplateItem,
} from './InflatorRepository';
import { CaseBase } from './Components/Switch';
import { useTemplateContext } from './TemplateContext';
import {
  createTemplateValue,
  isTemplateValue,
  TemplateValue,
  TemplateValueInternal,
} from './TemplateValue';
import { generateId } from './Utils';
import { useWishlistContext } from './WishlistContext';

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
      !isTemplateValue(value) &&
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
    // TODO(janic): Need to call remove for template values created here.
    templateValue: createTemplateValue(() => {
      'worklet';
      return curTemplateType;
    }),
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
    const { inflatorId } = useWishlistContext();
    const { templateType } = useTemplateContext();

    const nativeId = useMemo(generateId, []);

    const otherPropsMemoized = useMemo(() => {
      const resolvedStyle = StyleSheet.flatten(style);

      const templateValues: {
        templateValue: TemplateValueInternal<any>;
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

        if (isTemplateValue(value)) {
          templateValues.push({ templateValue: value, targetPath: path });

          applyHacks();
        } else if (value instanceof TemplateCallback) {
          templateCallbacks.push({
            worklet: value.worklet,
            // Callbacks should never be in objects.
            eventName: value.eventName ?? path[0].replace(/^on/, 'top'),
          });
          // Events have a boolean prop associated to know whether the
          // function is set or not, so we still want to pass the prop.
          setInObject(otherProps, path, () => {});
        } else {
          // @ts-expect-error TODO: fix this.
          if (Component === ForEachBase && path[0] === 'template') {
            templateValues.push(convertToTemplateValue(value, path));
          }

          if (
            // @ts-expect-error TODO: fix this.
            Component === CaseBase &&
            path[0] === 'value' &&
            !isTemplateValue(value)
          ) {
            templateValues.push(convertToTemplateValue(value, path));
          }

          if (
            // @ts-expect-error TODO: fix this.
            Component === Text &&
            path[0] === 'children' &&
            !isTemplateValue(value)
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

          templateValues.forEach(({ templateValue }) => {
            templateValue.__setDirty();
          });

          const propsToSet: any = {};
          templateValues.forEach(({ templateValue, targetPath }) => {
            setInObject(propsToSet, targetPath, templateValue.value());
          });

          templateCallbacks.forEach(({ eventName, worklet }) => {
            templateItem.setCallback(eventName, (ev) => {
              worklet(ev, value, rootValue);
            });
          });

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
