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
import InflatorRepository, {
  ComponentPool,
  InflateMethod,
  MappingInflateMethod,
  TemplateItem,
} from './InflatorRepository';
import NativeTemplateContainer from './NativeViews/NativeTemplateContainer';
import NativeTemplateInterceptor from './NativeViews/NativeTemplateInterceptor';
import NativeWishList, {
  WishlistCommands,
} from './NativeViews/WishlistNativeComponent';

const OffsetComponent = '__offsetComponent';
let InflatorId = 1000;

type Mapping = {
  templateType?: string;
  onInflate: MappingInflateMethod;
};

const MappingContext = createContext<{inflatorId: string} | null>(null);

function getTemplatesFromChildren(children: React.ReactNode, width: number) {
  const nextTemplates: {[key: string]: React.ReactElement} = {
    [OffsetComponent]: <View style={{height: 0, width}} />,
  };
  React.Children.forEach(children, c => {
    if ((c as any).type.displayName === 'WishListTemplate') {
      const templateElement = c as React.ReactElement<TemplateProps>;
      nextTemplates[templateElement.props.type] = templateElement;
    }
  });
  return nextTemplates;
}

function getMappingsFromChildren(children: React.ReactNode) {
  const nextMappings: {
    [key: string]: Mapping;
  } = {};
  React.Children.forEach(children, c => {
    if ((c as any).type.displayName === 'WishListMapping') {
      const mappingComponent = c as React.ReactElement<MappingProps>;
      nextMappings[mappingComponent.props.nativeId] = {
        onInflate: mappingComponent.props.onInflate,
        templateType: mappingComponent.props.templateType,
      };
    }
  });
  return nextMappings;
}

type WishListInstance = {
  scrollToItem: (index: number, animated?: boolean) => void;
  scrollToTop: () => void;
};

export type BaseItem = {type: string};

type Props<ItemT extends BaseItem> = ViewProps & {
  inflateItem?: InflateMethod;
  onItemNeeded: (index: number) => ItemT;
  onStartReached?: () => void;
  onEndReached?: () => void;
  initialIndex?: number;
};

const Component = forwardRef(
  <T extends BaseItem>(
    {inflateItem, onItemNeeded, children, style, ...rest}: Props<T>,
    ref: React.Ref<WishListInstance>,
  ) => {
    const nativeWishlist = useRef(null); // TODO type it properly
    useImperativeHandle(
      ref,
      (): WishListInstance => ({
        scrollToItem: (index: number, animated?: boolean) => {
          if (nativeWishlist.current != null) {
            WishlistCommands.scrollToItem(
              nativeWishlist.current,
              index,
              animated ?? true,
            );
          }
        },
        scrollToTop: () => {
          if (nativeWishlist.current != null) {
            WishlistCommands.scrollToItem(nativeWishlist.current, 0, true);
          }
        },
      }),
    );

    const {width} = useWindowDimensions();
    useMemo(() => initEventHandler(), []);

    if (inflateItem === undefined && onItemNeeded === undefined) {
      throw Error('Either inflateItem or onItemNeeded must be defined');
    }

    const templatesRef = useRef<{[key: string]: React.ReactElement}>({});
    const mappingRef = useRef<{[key: string]: Mapping}>({});

    // Template registration and tracking
    useMemo(() => {
      templatesRef.current = getTemplatesFromChildren(children, width);
    }, [children, width]);

    // Mapping registration and tracking
    useMemo(() => {
      mappingRef.current = getMappingsFromChildren(children);
    }, [children, width]);

    // Resolve inflator - either use the provided callback or use the mapping
    const resolvedInflater: InflateMethod = useMemo(() => {
      if (inflateItem) {
        return inflateItem;
      }

      return (index: number, pool: ComponentPool) => {
        'worklet';
        const value = onItemNeeded(index);
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

export function createTemplateComponent<PropsT extends {}>(
  Component: React.ComponentType<PropsT>,
  addProps?: (templateItem: TemplateItem, props: any) => void,
): React.ComponentType<PropsT> {
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
        (value, templateItem) => {
          'worklet';
          const propsToSet: any = {};
          for (const {mapper, targetPath} of templateValues) {
            setInObject(propsToSet, targetPath, mapper(value));
          }
          // Styles need to be passed as props.
          const {style, ...otherPropsToSet} = propsToSet;
          const finalPropsToSet = {...otherPropsToSet, ...style};
          if (addProps) {
            addProps(templateItem, finalPropsToSet);
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

type MappingProps = {
  nativeId: string;
  templateType?: string;
  onInflate: MappingInflateMethod;
};

const Mapping: React.FC<MappingProps> = () => null;

Template.displayName = 'WishListTemplate';

Mapping.displayName = 'WishListMapping';

export const WishList = {
  Component,
  Template,
  Mapping,
  Image: createTemplateComponent(Image),
  Text: createTemplateComponent(Text, (item, props) => {
    'worklet';

    const {children, ...other} = props;
    item.RawText?.addProps({text: children});
    item.addProps(other);
  }),
};
