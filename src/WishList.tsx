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
import { createTemplateComponent } from './createTemplateComponent';
import { CallbacksRegistry, initEventHandler } from './EventHandler';
import { ForEach } from './ForEach';
import { Pressable } from './Pressable';
import InflatorRepository, {
  ComponentPool,
  InflateMethod,
  MappingInflateMethod,
} from './InflatorRepository';
import NativeTemplateContainer from './NativeViews/NativeTemplateContainer';
import NativeTemplateInterceptor from './NativeViews/NativeTemplateInterceptor';
import NativeWishList, {
  WishlistCommands,
} from './NativeViews/WishlistNativeComponent';
import { TemplateContext } from './TemplateContext';
import { WishListContext } from './WishListContext';

const OffsetComponent = '__offsetComponent';
let InflatorId = 1000;

type Mapping = {
  templateType?: string;
  onInflate: MappingInflateMethod;
};

type NestedTemplatesContextValue = {
  templates: { [key: string]: any };
  registerTemplate(type: string, component: any): void;
};

const TemplatesRegistryContext =
  createContext<NestedTemplatesContextValue | null>(null);

function getTemplatesFromChildren(children: React.ReactNode, width: number) {
  const nextTemplates: { [key: string]: React.ReactElement } = {
    [OffsetComponent]: <View style={[styles.offsetView, { width }]} />,
  };
  React.Children.forEach(children, (c) => {
    if ((c as any)?.type.displayName === 'WishListTemplate') {
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
  React.Children.forEach(children, (c) => {
    if ((c as any)?.type.displayName === 'WishListMapping') {
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

export type BaseItem = { type: string };

type Props<ItemT extends BaseItem> = ViewProps & {
  inflateItem?: InflateMethod;
  onItemNeeded: (index: number) => ItemT;
  onStartReached?: () => void;
  onEndReached?: () => void;
  initialIndex?: number;
};

const Component = forwardRef(
  <T extends BaseItem>(
    { inflateItem, onItemNeeded, children, style, ...rest }: Props<T>,
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

    const { width } = useWindowDimensions();
    useMemo(() => initEventHandler(), []);

    if (inflateItem === undefined && onItemNeeded === undefined) {
      throw Error('Either inflateItem or onItemNeeded must be defined');
    }

    // Template registration and tracking
    const childrenTemplates = useMemo(
      () => getTemplatesFromChildren(children, width),
      [children, width],
    );

    const templatesRegistry = useMemo<NestedTemplatesContextValue>(
      () => ({
        templates: {},
        registerTemplate(type, component) {
          if (this.templates[type]) {
            return;
          }

          this.templates[type] = component;
        },
      }),
      [],
    );

    // Mapping registration and tracking
    const mappings = useMemo(() => {
      return getMappingsFromChildren(children);
    }, [children]);

    return (
      <TemplatesRegistryContext.Provider value={templatesRegistry}>
        <>
          {/* Prerender templates to register all the nested templates */}
          <View style={styles.noDisplay}>
            {Object.keys(childrenTemplates).map((c, i) => (
              <View key={c[i] + 'prerender'}>
                <TemplateContext.Provider
                  value={{ templateType: c, renderChildren: true }}
                >
                  {childrenTemplates[c]}
                </TemplateContext.Provider>
              </View>
            ))}
          </View>

          <InnerComponent
            inflateItem={inflateItem}
            onItemNeeded={onItemNeeded}
            mappings={mappings}
            style={style}
            nativeWishlist={nativeWishlist}
            rest={rest}
            templates={childrenTemplates}
            nestedTemplates={templatesRegistry.templates}
            callbacks={CallbacksRegistry.callbacks}
          />
        </>
      </TemplatesRegistryContext.Provider>
    );
  },
);

type InnerComponentProps = ViewProps & {
  nativeWishlist: any;
  rest: any;
  templates: { [key: string]: any };
  nestedTemplates: { [key: string]: any };
  mappings: { [key: string]: any };
  callbacks: { [key: string]: any };
  inflateItem: any;
  onItemNeeded: any;
};

function InnerComponent({
  mappings,
  style,
  nativeWishlist,
  rest,
  templates,
  nestedTemplates,
  callbacks,
  inflateItem,
  onItemNeeded,
}: InnerComponentProps) {
  // Resolve inflator - either use the provided callback or use the mapping
  const combinedMappings = useMemo(() => ({ ...mappings, ...callbacks }), []);

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

      Object.keys(combinedMappings).forEach((key) => {
        const templateItem = item.getByWishId(key);
        if (
          templateItem &&
          (combinedMappings[key].templateType !== undefined
            ? combinedMappings[key].templateType === value.type
            : true)
        ) {
          try {
            combinedMappings[key].onInflate(value, templateItem, pool);
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
  }, [inflateItem, onItemNeeded, combinedMappings]);

  const inflatorIdRef = useRef<string | null>(null);
  const prevInflatorRef = useRef<typeof resolvedInflater>();

  // Inflator registration and tracking
  const inflatorId = useMemo(() => {
    if (prevInflatorRef.current !== resolvedInflater) {
      // Unregister?
      if (inflatorIdRef.current) {
        InflatorRepository.unregister(inflatorIdRef.current);
      }
      // Register
      inflatorIdRef.current = (InflatorId++).toString();
      InflatorRepository.register(inflatorIdRef.current, resolvedInflater);
    }
    return inflatorIdRef.current!;
  }, [resolvedInflater, inflatorIdRef]);

  const combinedTemplates = { ...templates, ...nestedTemplates };

  const keys = Object.keys(combinedTemplates);
  // console.log('@@@ Render WishList', inflatorId, keys.join(', '));

  const mappingContext = useMemo(
    () => ({
      inflatorId: inflatorIdRef.current,
    }),
    [inflatorIdRef],
  );

  return (
    <WishListContext.Provider value={mappingContext}>
      <NativeTemplateInterceptor
        inflatorId={inflatorId}
        style={style}
        collapsable={false}
        removeClippedSubviews={false}
      >
        <NativeWishList
          style={styles.flex}
          ref={nativeWishlist}
          removeClippedSubviews={false}
          inflatorId={inflatorId}
          onEndReached={rest?.onEndReached}
          onStartReached={rest?.onStartReached}
          initialIndex={rest.initialIndex ?? 0}
        />

        <NativeTemplateContainer
          names={keys}
          inflatorId={inflatorId}
          key={Math.random().toString()}
          collapsable={false}
        >
          {Object.keys(combinedTemplates).map((c, i) => (
            <View key={keys[i]}>
              <TemplateContext.Provider value={{ templateType: c }}>
                {combinedTemplates[c]}
              </TemplateContext.Provider>
            </View>
          ))}
        </NativeTemplateContainer>
      </NativeTemplateInterceptor>
    </WishListContext.Provider>
  );
}

type TemplateProps = {
  type: string;
  children: React.ReactElement;
};

function Template({ children, type }: TemplateProps) {
  const registry = useContext(TemplatesRegistryContext);
  const templates = useContext(TemplateContext);

  registry?.registerTemplate(type, children);

  return templates?.renderChildren ? children : null;
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
  Pressable,
  Image: createTemplateComponent(Image),
  Text: createTemplateComponent(Text, (item, props) => {
    'worklet';

    const { children, ...other } = props;
    item.RawText?.addProps({ text: children });
    item.addProps(other);
  }),

  IF: createTemplateComponent(View, (item, props) => {
    'worklet';

    if (props.condition) {
      item.addProps({ display: 'flex' });
    } else {
      item.addProps({ display: 'none' });
    }
  }),

  /**
   * TODO(Szymon) It's just a prototype we have to think about matching new and old children
   * TODO(Szymon) implement setChildren
   */
  ForEach,
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  noDisplay: { display: 'none' },
  offsetView: { height: 0 },
});
