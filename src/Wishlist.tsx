import React, {
  createContext,
  Ref,
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
import { generateId } from './Utils';
import { useWishlistContext, WishlistContext } from './WishlistContext';
import { UpdateJob, useInternalWishlistData } from './WishlistData';
import { createRunInJsFn, createRunInWishlistFn } from './WishlistJsRuntime';

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

export type WishListInstance<T extends BaseItem> = {
  scrollToItem: (index: number, animated?: boolean) => void;
  scrollToTop: () => void;
  update: (updateJob: UpdateJob<T>) => Promise<unknown>;
};

export type BaseItem = { type: string; key: string };

type Props<ItemT extends BaseItem> = ViewProps & {
  initialData: ItemT[];
  onStartReached?: () => void;
  onEndReached?: () => void;
  initialIndex?: number;
};

function ComponentBase<T extends BaseItem>(
  { children, style, initialData, ...rest }: Props<T>,
  ref: React.Ref<WishListInstance<T>>,
) {
  const nativeWishlist = useRef(null); // TODO type it properly
  const wishlistId = useRef<string | null>(null);
  if (!wishlistId.current) {
    wishlistId.current = generateId();
  }

  const data = useInternalWishlistData<T>(wishlistId.current, initialData);

  useImperativeHandle(
    ref,
    (): WishListInstance<T> => ({
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
      update: async (updateJob: UpdateJob<T>) => {
        return new Promise((resolve, _reject) => {
          const resolveJs = createRunInJsFn(resolve);
          createRunInWishlistFn(() => {
            'worklet';
            // we have to do sth here to get rid of frozen objs
            // otherwise data can't be modified
            data().update(updateJob, resolveJs);
          })();
        });
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
    return (index: number, pool: ComponentPool) => {
      'worklet';
      const value = data().at(index);
      if (!value) {
        return undefined;
      }

      console.log(
        'returned',
        value,
        'for index',
        index,
        'data len',
        data().length(),
      );

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
  }, [data]);

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
          />
        </>
      </TemplatesRegistryContext.Provider>
    </WishlistContext.Provider>
  );
}

const Component = React.forwardRef(
  ComponentBase as <T extends BaseItem>(
    props: Props<T> & { ref?: Ref<WishListInstance<T>> },
  ) => ReturnType<typeof ComponentBase>,
);

type InnerComponentProps = ViewProps & {
  inflatorId: string;
  nativeWishlist: any;
  rest: any;
  templates: { [key: string]: any };
  nestedTemplates: { [key: string]: any };
};

function InnerComponent({
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
});
