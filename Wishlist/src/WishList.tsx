import React, {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native';
import {initEventHandler} from './EventHandler';
import InflatorRepository from './InflatorRepository';
import NativeTemplateContainer from './NativeViews/NativeTemplateContainer';
import NativeTemplateInterceptor from './NativeViews/NativeTemplateInterceptor';
import NativeWishList, {
  WishlistCommands,
} from './NativeViews/WishlistNativeComponent';

const OffsetComponent = '__offsetComponent';
let InflatorId = 1000;

type Mapping = {
  [key: string]: {
    templateType?: string;
    onInflate: (value: any, item: any) => void;
  };
};

const MappingContext = createContext<{inflatorId: string} | null>(null);

function getTemplatesFromChildren(children, width) {
  const nextTemplates = {
    [OffsetComponent]: <View style={{height: 0, width}} />,
  };
  React.Children.forEach(children, c => {
    if (c.type.displayName === 'WishListTemplate') {
      nextTemplates[c.props.type] = c;
    }
  });
  return nextTemplates;
}

function getMappingsFromChildren(children) {
  const nextMappings = {};
  React.Children.forEach(children, c => {
    if (c.type.displayName === 'WishListMapping') {
      nextMappings[c.props.nativeId] = {
        onInflate: c.props.onInflate,
        templateType: c.props.templateType,
      };
    }
  });
  return nextMappings;
}

type TemplateRegistry = {
  getComponent: (type: string) => any;
};

type Props = ViewProps & {
  inflateItem?: (index: number, pool: TemplateRegistry) => React.ReactElement;
  onItemNeeded?: (index: number) => any;
};

const Component = forwardRef<any, Props>(
  ({inflateItem, onItemNeeded, children, style, ...rest}, ref) => {
    const nativeWishlist = useRef(null); // TODO type it properly
    useImperativeHandle(ref, () => ({
      scrollToItem: (index: number, animated?: boolean) => {
        WishlistCommands.scrollToItem(
          nativeWishlist.current,
          index,
          animated ?? true,
        );
      },
      scrollToTop: () => {
        WishlistCommands.scrollToItem(nativeWishlist.current, 0, true);
      },
    }));

    const {width} = useWindowDimensions();
    useMemo(() => initEventHandler(), []);

    if (inflateItem === undefined && onItemNeeded === undefined) {
      throw Error('Either inflateItem or onItemNeeded must be defined');
    }

    const templatesRef = useRef<{[key: string]: React.ReactElement}>({});
    const mappingRef = useRef<Mapping>({});

    // Template registration and tracking
    useMemo(() => {
      templatesRef.current = getTemplatesFromChildren(children, width);
    }, [children, width]);

    // Mapping registration and tracking
    useMemo(() => {
      mappingRef.current = getMappingsFromChildren(children);
    }, [children, width]);

    // Resolve inflator - either use the provided callback or use the mapping
    const resolvedInflater = useMemo(() => {
      if (inflateItem) {
        return inflateItem;
      }

      return (index: number, pool: any) => {
        'worklet';
        const value = onItemNeeded!(index);
        if (!value) {
          return undefined;
        }

        const item = pool.getComponent(value.type);
        if (!item) {
          return undefined;
        }

        Object.keys(mappingRef.current!).forEach(key => {
          const templateItem = item.getByWishId(key);
          if (
            templateItem &&
            (mappingRef.current![key].templateType !== undefined
              ? mappingRef.current![key].templateType === value.type
              : true)
          ) {
            try {
              mappingRef.current![key].onInflate(value, templateItem);
            } catch (err) {
              console.error(
                'Error calling mapper for key / template',
                key,
                value.type,
                err,
              );
            }
          }
        });

        return [item, value];
      };
    }, [inflateItem, onItemNeeded]);

    const inflatorIdRef = useRef<string | null>(null);
    const prevInflatorRef = useRef<typeof resolvedInflater>();

    // Inflator registration and tracking
    useMemo(() => {
      if (prevInflatorRef.current !== resolvedInflater) {
        // Unregister?
        if (inflatorIdRef.current) {
          InflatorRepository.unregister(inflatorIdRef.current);
        }
        // Register
        inflatorIdRef.current = (InflatorId++).toString();
        InflatorRepository.register(inflatorIdRef.current, resolvedInflater);
      }
    }, [resolvedInflater]);

    const keys = Object.keys(templatesRef.current);
    console.log('@@@ Render WishList', inflatorIdRef.current, keys.join(', '));

    const mappingContext = useMemo(
      () => ({
        inflatorId: inflatorIdRef.current!,
      }),
      [inflatorIdRef.current],
    );

    return (
      <MappingContext.Provider value={mappingContext}>
        <NativeTemplateInterceptor
          inflatorId={inflatorIdRef.current!}
          style={style}
          collapsable={false}
          removeClippedSubviews={false}>
          <NativeWishList
            style={{flex: 1}}
            ref={nativeWishlist}
            removeClippedSubviews={false}
            inflatorId={inflatorIdRef.current!}
            onEndReached={rest?.onEndReached}
            onStartReached={rest?.onStartReached}
            initialIndex={rest.initialIndex ?? 0}
          />

          <NativeTemplateContainer
            names={keys}
            inflatorId={inflatorIdRef.current!}
            key={Math.random().toString()}
            collapsable={false}>
            {Object.keys(templatesRef.current).map((c, i) => (
              <View key={keys[i]}>{templatesRef.current[c]}</View>
            ))}
          </NativeTemplateContainer>
        </NativeTemplateInterceptor>
      </MappingContext.Provider>
    );
  },
);

type TemplateProps = {
  type: string;
  children: React.ReactElement;
};

function Template({children}: TemplateProps) {
  return children;
}

let nativeIdGenerator = 0;

function useMappingContext() {
  const context = useContext(MappingContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}

type TemplateValueMapper<T, K> = (item: T) => K;

class TemplateValue<T, K> {
  _mapper: TemplateValueMapper<T, K>;

  constructor(mapper: TemplateValueMapper<T, K>) {
    this._mapper = mapper;
  }

  getMapper() {
    return this._mapper;
  }
}

export function useTemplateValue<T, K>(mapper: TemplateValueMapper<T, K>) {
  return useMemo(() => {
    return new TemplateValue(mapper);
  }, [mapper]) as unknown as K;
}

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
  addProps?: (templateItem, props: any, inflatorId: string, componentRegistry: any) => void
): T {
  const WishListComponent = forwardRef<any, any>(({style, ...props}, ref) => {
    const {inflatorId} = useMappingContext();
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
        setInObject(otherProps, path, value);
      }
    });

    const nativeId = useMemo(() => `template_id_${nativeIdGenerator++}`, []);

    useMemo(() => {
      InflatorRepository.registerMapping(
        inflatorId,
        nativeId,
        (value, templateItem, pool) => {
          'worklet';
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

    // @ts-expect-error TODO: fix this.
    return <Component ref={ref} {...otherProps} nativeID={nativeId} />;
  }) as unknown as T;

  WishListComponent.displayName = `WishList(${Component.displayName})`;

  return WishListComponent;
}

type MappingProps = {
  nativeId: string;
  templateType?: string;
  onInflate: (value: any, item: any) => any;
};

const Mapping: React.FC<MappingProps> = () => null;

Template.displayName = 'WishListTemplate';

Mapping.displayName = 'WishListMapping';

export const WishList = {
  Component,
  Template,
  Mapping,
  // @ts-expect-error TODO: fix this.
  Image: createTemplateComponent(Image),
  // @ts-expect-error TODO: fix this.
  Text: createTemplateComponent(Text, (item, props) => {
    'worklet';

    const {children, ...other} = props;
    item.RawText.addProps({text: children});
    item.addProps(other);
  }),

  IF: createTemplateComponent(View, (item, props) => {
    'worklet';

    if (props.condition) {
      item.addProps({display: 'flex'});
    } else {
      item.addProps({display: 'none'});
    }
  }),

  ForEach: createTemplateComponent(View, (item, props, inflatorId, componentRegistry) => {
    'worklet';

    const subItems = props.subItems;
    const items = subItems.map((subItem) => {
      const [item, value] = [componentRegistry.getComponent(props.template), subItem];
      const child = global.InflatorRegistry.useMappings(item, value, inflatorId, componentRegistry);
      return child;
    });

    item.setChildren(items);
  })

};
