import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, useWindowDimensions, View, ViewProps } from 'react-native';
import { ForEach } from './Components/ForEach';
import { IF } from './Components/IF';
import { Pressable } from './Components/Pressable';
import { Case, Switch } from './Components/Switch';
import { WishlistImage } from './Components/WishlistImage';
import { WishlistText } from './Components/WishlistText';
import { WishlistView } from './Components/WishlistView';
import { initEventHandler } from './EventHandler';
import InflatorRepository, {
  ComponentPool,
  InflateMethod,
} from './InflatorRepository';
import NativeTemplateContainer from './NativeViews/NativeTemplateContainer';
import NativeTemplateInterceptor from './NativeViews/NativeTemplateInterceptor';
import NativeWishList, {
  Commands as WishlistCommands,
} from './NativeViews/WishlistNativeComponent';
import { TemplateContext } from './TemplateContext';
import { useWishlistContext, WishlistContext } from './WishlistContext';
import { generateId } from './Utils';
import { useSetupGlobalState } from './globalState';

const OffsetComponent = '__offsetComponent';

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
    if ((c as any).type.displayName === 'WishListTemplate') {
      const templateElement = c as React.ReactElement<TemplateProps>;
      nextTemplates[templateElement.props.type] = templateElement;
    }
  });
  return nextTemplates;
}

type WishListInstance = {
  scrollToItem: (index: number, animated?: boolean) => void;
  scrollToTop: () => void;
};

export type BaseItem = { type: string; key: string };

type Props<ItemT extends BaseItem> = ViewProps & {
  data: ItemT[];
  inflateItem?: InflateMethod;
  onItemNeeded?: (index: number) => ItemT;
  onStartReached?: () => void;
  onEndReached?: () => void;
  initialIndex?: number;
  globalState?: Record<string, unknown>;
};

const Component = forwardRef(
  <T extends BaseItem>(
    {
      inflateItem,
      onItemNeeded,
      children,
      style,
      data,
      globalState,
      ...rest
    }: Props<T>,
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

    if (
      inflateItem === undefined &&
      onItemNeeded === undefined &&
      data === undefined
    ) {
      throw Error('Either inflateItem, onItemNeeded or data must be defined');
    }

    const onItemNeededInternal = useCallback(
      (index: number) => {
        'worklet';

        if (onItemNeeded) {
          return onItemNeeded(index);
        } else {
          return data[index];
        }
      },
      [onItemNeeded, data],
    );

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

    // Resolve inflator - either use the provided callback or use the mapping
    const resolvedInflater: InflateMethod = useMemo(() => {
      if (inflateItem) {
        return inflateItem;
      }

      return (index: number, pool: ComponentPool) => {
        'worklet';
        const value = onItemNeededInternal(index);
        if (!value) {
          return undefined;
        }

        const item = pool.getComponent(value.type);
        if (!item) {
          return undefined;
        }

        if (value.key == null) {
          throw new Error('Every data cell has to contain unique key prop!');
        }
        // We set the key of the item here so that
        // viewportObserver knows what's the key and is able to rerender it later on
        item.key = value.key;

        return [item, value];
      };
    }, [inflateItem, onItemNeededInternal]);

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
        inflatorIdRef.current = generateId();
        InflatorRepository.register(inflatorIdRef.current, resolvedInflater);
      }
      return inflatorIdRef.current!;
    }, [resolvedInflater]);

    const wishlistId = useRef<string | null>(null);
    if (!wishlistId.current) {
      wishlistId.current = generateId();
    }
    const wishlistContext = useMemo(
      () => ({
        id: wishlistId.current!,
        inflatorId,
        globalState,
      }),
      // we don't need to recreate context on globalState change
      // this was used only for the initial render
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [inflatorId],
    );

    useSetupGlobalState(wishlistId.current!, inflatorId, globalState);

    return (
      <WishlistContext.Provider value={wishlistContext}>
        <TemplatesRegistryContext.Provider value={templatesRegistry}>
          <>
            {/* Prerender templates to register all the nested templates */}
            <View style={styles.noDisplay}>
              {Object.keys(childrenTemplates).map((c) => (
                <View key={c + 'prerender'}>
                  <TemplateContext.Provider
                    value={{ templateType: c, renderChildren: true }}
                  >
                    {childrenTemplates[c]}
                  </TemplateContext.Provider>
                </View>
              ))}
            </View>

            <InnerComponent
              inflatorId={inflatorId}
              style={style}
              nativeWishlist={nativeWishlist}
              rest={rest}
              templates={childrenTemplates}
              nestedTemplates={templatesRegistry.templates}
            />
          </>
        </TemplatesRegistryContext.Provider>
      </WishlistContext.Provider>
    );
  },
);

type InnerComponentProps = ViewProps & {
  inflatorId: string;
  nativeWishlist: any;
  rest: any;
  templates: { [key: string]: any };
  nestedTemplates: { [key: string]: any };
};

const InnerComponent = React.memo(function InnerComponent({
  inflatorId,
  style,
  nativeWishlist,
  rest,
  templates,
  nestedTemplates,
}: InnerComponentProps) {
  const combinedTemplates = { ...templates, ...nestedTemplates };

  const { id } = useWishlistContext();

  const keys = Object.keys(combinedTemplates);
  // console.log('@@@ Render WishList', inflatorId, keys.join(', '));

  return (
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
        wishlistId={id}
        key={Math.random().toString()}
        collapsable={false}
      >
        {Object.keys(combinedTemplates).map((c) => (
          <View key={c}>
            <TemplateContext.Provider value={{ templateType: c }}>
              {combinedTemplates[c]}
            </TemplateContext.Provider>
          </View>
        ))}
      </NativeTemplateContainer>
    </NativeTemplateInterceptor>
  );
});

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

Template.displayName = 'WishListTemplate';

export const Wishlist = {
  Component,
  Template,

  Pressable,
  View: WishlistView,
  Image: WishlistImage,
  Text: WishlistText,

  IF,
  Switch,
  Case,
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
