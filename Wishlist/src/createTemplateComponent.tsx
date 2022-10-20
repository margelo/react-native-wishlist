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

export function createTemplateComponent<PropsT extends {}>(
  Component: React.ComponentType<PropsT>,
  addProps?: (
    templateItem: TemplateItem,
    props: any,
    inflatorId: string,
    pool: ComponentPool,
  ) => void,
): React.ComponentType<PropsT> {
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
  }) as unknown as React.ComponentType<PropsT>;

  WishListComponent.displayName = `WishList(${Component.displayName})`;

  return WishListComponent;
}
