import React, {
  createContext,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { ComponentPool } from './ComponentPool';
import { ForEach } from './Components/ForEach';
import { IF } from './Components/IF';
import { Pressable } from './Components/Pressable';
import { Case, Switch } from './Components/Switch';
import { WishlistImage } from './Components/WishlistImage';
import { WishlistText } from './Components/WishlistText';
import { WishlistView } from './Components/WishlistView';
import { initEventHandler } from './EventHandler';
import InflatorRepository, { InflateMethod } from './InflatorRepository';
import NativeContentContainer from './Specs/NativeContentContainer';
import NativeTemplateContainer from './Specs/NativeTemplateContainer';
import NativeTemplateInterceptor from './Specs/NativeTemplateInterceptor';
import NativeWishList, {
  Commands as WishlistCommands,
} from './Specs/NativeWishlist';
import { TemplateContext } from './TemplateContext';
import { TemplateItem } from './TemplateItem';
import { generateId } from './Utils';
import { useWishlistContext, WishlistContext } from './WishlistContext';
import type { WishlistData, WishlistDataInternal } from './WishlistData';

type NestedTemplatesContextValue = {
  templates: { [key: string]: any };
  registerTemplate(type: string, component: any): void;
};

const TemplatesRegistryContext =
  createContext<NestedTemplatesContextValue | null>(null);

function getTemplatesFromChildren(children: React.ReactNode, width: number) {
  const nextTemplates: { [key: string]: React.ReactElement } = {
    __offsetComponent: <View style={[styles.offsetView, { width }]} />,
    __viewComponent: <View />,
    __textComponent: (
      <Text>
        <Text> </Text>
      </Text>
    ),
    __paragraphComponent: <Text> </Text>,
  };
  React.Children.forEach(children, (c) => {
    if ((c as any).type.displayName === 'WishListTemplate') {
      const templateElement = c as React.ReactElement<TemplateProps>;
      nextTemplates[templateElement.props.type] = templateElement;
    }
  });
  return nextTemplates;
}

export type WishListInstance = {
  scrollToItem: (index: number, animated?: boolean) => void;
  scrollToTop: () => void;
};

export type BaseItem = { type: string; key: string };

type Props = ViewProps & {
  data: WishlistData<any>;
  onStartReached?: () => void;
  onEndReached?: () => void;
  initialIndex?: number;
  contentContainerStyle?: StyleProp<ViewStyle> | undefined;
  /**
   * Rendered at the bottom of all the items. Can be a React Component Class, a render function, or
   * a rendered element.
   */
  ListFooterComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
  /**
   * Rendered at the top of all the items. Can be a React Component Class, a render function, or
   * a rendered element.
   */
  ListHeaderComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
};

function ComponentBase<T extends BaseItem>(
  {
    children,
    style,
    data,
    contentContainerStyle,
    ListFooterComponent,
    ListHeaderComponent,
    ...rest
  }: Props,
  ref: React.Ref<WishListInstance>,
) {
  const nativeWishlist = useRef<InstanceType<typeof NativeWishList> | null>(
    null,
  );
  const wishlistId = useRef<string | null>(null);
  if (!wishlistId.current) {
    wishlistId.current = generateId();
  }

  useImperativeHandle(
    ref,
    (): WishListInstance => ({
      scrollToItem: (index: number, animated?: boolean) => {
        if (nativeWishlist.current != null) {
          console.log('scrollTo', index);
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

  // Template registration and tracking
  const childrenTemplates = useMemo(
    () => getTemplatesFromChildren(children, width),
    [children, width],
  );

  if (ListHeaderComponent) {
    childrenTemplates.__wishlistHeader = React.isValidElement(
      ListHeaderComponent,
    ) ? (
      ListHeaderComponent
    ) : (
      // @ts-expect-error
      <ListHeaderComponent />
    );
  }

  if (ListFooterComponent) {
    childrenTemplates.__wishlistFooter = React.isValidElement(
      ListFooterComponent,
    ) ? (
      ListFooterComponent
    ) : (
      // @ts-expect-error
      <ListFooterComponent />
    );
  }

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

  const hasHeader = !!ListHeaderComponent;
  const hasFooter = !!ListFooterComponent;

  // Resolve inflator - either use the provided callback or use the mapping
  const resolvedInflater: InflateMethod = useMemo(() => {
    return (
      index: number,
      pool: ComponentPool,
      previousItem: TemplateItem | null,
    ) => {
      'worklet';
      const internalData = data as WishlistDataInternal<T>;

      let value: T | undefined;
      if (hasHeader && index === internalData.__firstIndex() - 1) {
        value = { key: '__wishlistHeader', type: '__wishlistHeader' } as T;
      } else if (hasFooter && index === internalData.__lastIndex()) {
        value = { key: '__wishlistFooter', type: '__wishlistFooter' } as T;
      } else {
        value = internalData.__at(index);
      }

      if (!value) {
        return undefined;
      }

      const item =
        previousItem != null &&
        previousItem.type === value.type &&
        previousItem.key === value.key
          ? previousItem
          : pool.getComponent(value.type);
      if (!item) {
        return undefined;
      }

      if (value.key == null) {
        throw new Error('Every data cell has to contain unique key prop!');
      }
      // We set the key of the item here so that
      // viewportObserver knows what's the key and is able to rerender it later on
      item.key = value.key;
      item.type = value.type;

      return [item, value];
    };
  }, [data, hasFooter, hasHeader]);

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

  useEffect(() => {
    (data as WishlistDataInternal<T>).__attach(wishlistId.current!);

    return () => {
      (data as WishlistDataInternal<T>).__detach(wishlistId.current!);
    };
  }, [data]);

  const wishlistContext = useMemo(
    () => ({
      id: wishlistId.current!,
      inflatorId,
      data,
    }),
    [inflatorId, data],
  );

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
            contentContainerStyle={contentContainerStyle}
            initialIndex={rest.initialIndex ?? (hasHeader ? -1 : 0)}
          />
        </>
      </TemplatesRegistryContext.Provider>
    </WishlistContext.Provider>
  );
}

const Component = React.forwardRef(
  ComponentBase as (
    props: Props & { ref?: Ref<WishListInstance> },
  ) => ReturnType<typeof ComponentBase>,
);

type InnerComponentProps = ViewProps & {
  inflatorId: string;
  nativeWishlist: any;
  rest: any;
  templates: { [key: string]: any };
  nestedTemplates: { [key: string]: any };
  contentContainerStyle?: StyleProp<ViewStyle> | undefined;
  initialIndex: number;
};

function InnerComponent({
  inflatorId,
  style,
  nativeWishlist,
  rest,
  templates,
  nestedTemplates,
  contentContainerStyle,
  initialIndex,
}: InnerComponentProps) {
  const combinedTemplates: { [key: string]: React.ReactElement<any> } = {
    ...templates,
    ...nestedTemplates,
  };

  const { id } = useWishlistContext();

  const keys = Object.keys(combinedTemplates);

  return (
    <NativeTemplateInterceptor
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
        initialIndex={initialIndex}
      >
        <NativeContentContainer
          collapsable={false}
          style={contentContainerStyle}
        />
      </NativeWishList>
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
  contentContainer: {},
});
