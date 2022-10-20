import {forwardRef, useMemo} from 'react';
import {StyleSheet, Text} from 'react-native';
import {ForEachBase} from './ForEachBase';
import InflatorRepository, {
  ComponentPool,
  TemplateItem,
} from './InflatorRepository';
import {useTemplateContext} from './TemplateContext';
import {TemplateValue} from './TemplateValue';
import {useWishListContext} from './WishListContext';

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

type TemplateProps<T> = {
  [key in keyof T]: key extends NonTemplateProps
    ? T[key]
    : WithTemplateValue<T[key]>;
};

interface TemplateComponent<T extends React.ComponentType<any>>
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
  const stack: {path: string[]; value: any}[] = [{path: [], value: obj}];
  while (stack.length > 0) {
    const {path, value} = stack.pop()!;
    if (
      value &&
      typeof value === 'object' &&
      !(value instanceof TemplateValue)
    ) {
      Object.keys(value).forEach(key => {
        stack.push({path: [...path, key], value: value[key]});
      });
    } else {
      callback(path, value);
    }
  }
}

export function createTemplateComponent<T extends React.ComponentType<any>>(
  Component: T,
  addProps?: (
    templateItem: TemplateItem,
    props: any,
    inflatorId: string,
    pool: ComponentPool,
  ) => void,
): TemplateComponent<T> {
  const WishListComponent = forwardRef<any, any>(({style, ...props}, ref) => {
    const {inflatorId} = useWishListContext();
    const {templateType} = useTemplateContext();
    const resolvedStyle = StyleSheet.flatten(style);
    const templateValues: {mapper: any; targetPath: string[]}[] = [];
    const otherProps = {};
    traverseObject({...props, style: resolvedStyle}, (path, value) => {
      const applyHacks = () => {
        // Text component needs to receive a string child to work properly.
        // @ts-expect-error TODO: fix this.
        if (path[0] === 'children' && Component === Text) {
          setInObject(otherProps, path, ' ');
        }
      };

      if (value instanceof TemplateValue) {
        templateValues.push({mapper: value.getMapper(), targetPath: path});

        applyHacks();
      } else {
        // @ts-expect-error TODO: fix this.
        if (Component === ForEachBase && path[0] === 'template') {
          const templateType = value;
          templateValues.push({
            mapper: () => {
              'worklet';
              return templateType;
            },
            targetPath: path,
          });
        }
        setInObject(otherProps, path, value);
      }
    });

    const nativeId = useMemo(() => `template_id_${nativeIdGenerator++}`, []);

    useMemo(() => {
      InflatorRepository.registerMapping(
        inflatorId,
        nativeId,
        templateType,
        (value, templateItem, pool) => {
          'worklet';
          // console.log('mapping regis ', value);
          const propsToSet: any = {};
          for (const {mapper, targetPath} of templateValues) {
            setInObject(propsToSet, targetPath, mapper(value));
          }
          // Styles need to be passed as props.
          const {style, ...otherPropsToSet} = propsToSet;
          const finalPropsToSet = {...otherPropsToSet, ...style};
          if (addProps) {
            addProps(templateItem, finalPropsToSet, inflatorId, pool);
          } else {
            templateItem.addProps(finalPropsToSet);
          }
        },
      );
    }, [inflatorId, nativeId]);

    // @ts-expect-error: this is ok.
    return <Component {...otherProps} ref={ref} nativeID={nativeId} />;
  }) as unknown as TemplateComponent<T>;

  WishListComponent.displayName = `WishList(${Component.displayName})`;

  return WishListComponent;
}
