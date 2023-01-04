import React, { useMemo, useRef, forwardRef, useImperativeHandle, useContext, createContext } from "react";
import { View, ViewProps, useWindowDimensions, Text, Image } from "react-native";
import NativeWishList, { WishlistCommands } from "./NativeViews/WishlistNativeComponent";
import NativeTemplateContainer from "./NativeViews/NativeTemplateContainer";
import NativeTemplateInterceptor from "./NativeViews/NativeTemplateInterceptor";
import InflatorRepository from "./InflatorRepository";
import { initEventHandler } from "./EventHandler";

const OffsetComponent = "__offsetComponent";
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
    [OffsetComponent]: <View style={{ height: 0, width }} />,
  };
  React.Children.forEach(children, (c) => {
    if (c.type.displayName === "WishListTemplate") {
      nextTemplates[c.props.type] = c;
    }
  });
  return nextTemplates;
}

function getMappingsFromChildren(children) {
  const nextMappings = {};
  React.Children.forEach(children, (c) => {
    if (c.type.displayName === "WishListMapping") {
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

const Component = forwardRef<any, Props>(({
  inflateItem,
  onItemNeeded,
  children,
  style,
  ...rest
}, ref) => {
  const nativeWishlist = useRef(null); // TODO type it properly
  useImperativeHandle(ref, () => ({
    scrollToItem: (index: number, animated?: boolean) => {
      WishlistCommands.scrollToItem(nativeWishlist.current, index, animated ?? true);
    },
    scrollToTop: () => {
      WishlistCommands.scrollToItem(nativeWishlist.current, 0, true);
    },
  }));

  const { width } = useWindowDimensions();
  useMemo(() => initEventHandler(), []);

  if (inflateItem === undefined && onItemNeeded === undefined) {
    throw Error("Either inflateItem or onItemNeeded must be defined");
  }

  const templatesRef = useRef<{ [key: string]: React.ReactElement }>({});
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
      "worklet";
      const value = onItemNeeded!(index);
      if (!value) {
        return undefined;
      }

      const item = pool.getComponent(value.type);
      if (!item) {
        return undefined;
      }

      Object.keys(mappingRef.current!).forEach((key) => {
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
              "Error calling mapper for key / template",
              key,
              value.type,
              err
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
  console.log("@@@ Render WishList", inflatorIdRef.current, keys.join(", "));

  const mappingContext = useMemo(() => ({
    inflatorId: inflatorIdRef.current!,
  }), [inflatorIdRef.current]);

  return (
    <MappingContext.Provider value={mappingContext}>
      <NativeTemplateInterceptor
        inflatorId={inflatorIdRef.current!}
        style={style}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <NativeWishList
          style={{ flex: 1 }}
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
          collapsable={false}
        >
          {Object.keys(templatesRef.current).map((c, i) => (
            <View key={keys[i]}>{templatesRef.current[c]}</View>
          ))}
        </NativeTemplateContainer>
      </NativeTemplateInterceptor>
    </MappingContext.Provider>
  );
});

type TemplateProps<T> = {
  type: string;
  children: (item: T) => React.ReactElement;
};

type TemplateProxyTarget = {
  path: string[];
}

type TemplateProxy = {
  __isTemplateProxy: boolean;
  __templatePath: string[];
}

function Template<T>({ children,  }: TemplateProps<T>) {
  const templateProxy = useMemo(() => {
    const handler: ProxyHandler<TemplateProxyTarget> = {
      get(target, prop) {
        if (prop === '__isTemplateProxy') {
          return true;
        }
        if (prop === '__templatePath') {
          return target.path;
        }
        // TODO: This could be a Symbol.
        return new Proxy({path: [...target.path, prop]}, handler);
      }
    };
    return new Proxy({path: []}, handler);
  }, []);
  return children(templateProxy as unknown as T);
};

let nativeIdGenerator = 0;

function useMappingContext() {
  const context = useContext(MappingContext);
  if (!context) {
    throw Error("MappingContext is not defined");
  }
  return context;
}

function getInObject(obj: any, path: string[]) {
  'worklet';

  let current = obj;
  for (let i = 0; i < path.length; i++) {
    current = current[path[i]];
  }
  return current;
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

function traverseObject(obj: any, callback: (path: string[], value: any) => void) {
  const stack: {path: string[], value: any}[] = [{path: [], value: obj}];
  while (stack.length > 0) {
    const {path, value} = stack.pop()!;
    if (value && typeof value === 'object' && !value.__isTemplateProxy) {
      Object.keys(value).forEach((key) => {
        stack.push({path: [...path, key], value: value[key]});
      });
    } else {
      callback(path, value);
    }
  }
}

export function createTemplateComponent<T extends React.ComponentType<any>>(
  Component: T,
  addProps?: (templateItem, props: any) => void,
): T {
  return forwardRef<any, any>((props, ref) => {
    const {inflatorId} = useMappingContext();

    const proxyValues: {valuePath: string[], targetPath: string[]}[] = [];
    const otherProps = {};
    traverseObject(props, (path, value) => {
      if ((value as TemplateProxy).__isTemplateProxy) {
        proxyValues.push({targetPath: path, valuePath: (value as TemplateProxy).__templatePath});

        // Text component needs to receive a string child to work properly.
        // @ts-ignore
        if (path[0] === 'children' && Component === Text) {
          setInObject(otherProps, path, ' ');
        }
      } else {
        setInObject(otherProps, path, value);
      }
    });

    const nativeId = useMemo(() => `template_id_${nativeIdGenerator++}`, []);

    useMemo(() => {
      InflatorRepository.registerMapping(inflatorId, nativeId, (value, templateItem) => {
        'worklet';
        const propsToSet = {};
        for (const {valuePath, targetPath} of proxyValues) {
          setInObject(propsToSet, targetPath, getInObject(value, valuePath));
        }
        if (addProps) {
          addProps(templateItem, propsToSet);
        } else {
          templateItem.addProps(propsToSet);
        }
      })
    }, [inflatorId, nativeId]);

    return <Component ref={ref} {...otherProps} nativeID={nativeId} />;
  }) as unknown as T;
}

type MappingProps = {
  nativeId: string;
  templateType?: string;
  onInflate: (value: any, item: any) => any;
};

const Mapping: React.FC<MappingProps> = () => null;

Template.displayName = "WishListTemplate";
Template.Text = createTemplateComponent(Text, (item, props) => {
  'worklet';

  const {children, ...other} = props;
  item.RawText.addProps({text: children});
  item.addProps(other);
});
Template.Image = createTemplateComponent(Image);

Mapping.displayName = "WishListMapping";

export const WishList = {
  Component,
  Template,
  Mapping,
};
