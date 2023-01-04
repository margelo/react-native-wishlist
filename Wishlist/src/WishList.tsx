import React, { useEffect, useMemo, useRef, forwordRef, useImperativeHandle } from "react";
import { View, ViewProps, useWindowDimensions, Text } from "react-native";
import NativeWishList, { WishlistCommands } from "./NativeViews/NativeWishlistComponent";
import NativeTemplateContainer from "./NativeViews/NativeTemplateContainer";
import NativeTemplateInterceptor from "./NativeViews/NativeTemplateInterceptor";
import InflatorRepository from "./InflatorRepository";
import { initEventHandler } from "./EventHandler";

const OffsetComponent = "__offsetComponent";
let InflatorId = 1000;

function getTemplatesFromChildren(children, width) {
  const nextTemplates = {
    [OffsetComponent]: <View style={{ height: 0, width }} />,
  };
  React.Children.forEach(children, (c) => {
    if (c.type.displayName === "WishListTemplate") {
      nextTemplates[c.props.type] = React.Children.only(c.props.children);
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

const Component= forwordRef((({
  inflateItem,
  onItemNeeded,
  children,
  style,
}, ref) => { 
  const nativeWishlist = useRef(null); // TODO type it properly
  useImperativeHandle(ref, () => ({
    scrollToItem: (index: number, animated?: boolean) => {
      WishlistCommands.scrollToItem(nativeWishlist.current, index, animated ?? true);
    },
  }));

  const { width } = useWindowDimensions();
  useMemo(() => initEventHandler(), []);

  if (inflateItem === undefined && onItemNeeded === undefined) {
    throw Error("Either inflateItem or onItemNeeded must be defined");
  }

  const templatesRef = useRef<{ [key: string]: React.ReactElement }>({});
  const mappingRef = useRef<{
    [key: string]: {
      templateType: string;
      onInflate: (value: any, item: any) => void;
    };
  }>({});

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
      return item;
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

  return (
    <NativeTemplateInterceptor
      inflatorId={inflatorIdRef.current}
      style={style}
      collapsable={false}
      removeClippedSubviews={false}
    >
      <NativeWishList
        style={{ flex: 1 }}
        ref={nativeWishlist}
        removeClippedSubviews={false}
        inflatorId={inflatorIdRef.current}
      />

      <NativeTemplateContainer
        names={keys}
        inflatorId={inflatorIdRef.current}
        key={Math.random().toString()}
        collapsable={false}
      >
        {Object.keys(templatesRef.current).map((c, i) => (
          <View key={keys[i]}>{templatesRef.current[c]}</View>
        ))}
      </NativeTemplateContainer>
    </NativeTemplateInterceptor>
  );
}) as React.FC<Props> );
type TemplateProps = {
  type: string;
  children: React.ReactElement;
};

const Template: React.FC<TemplateProps> = ({ children }) => {
  return children;
};

type MappingProps = {
  nativeId: string;
  templateType?: string;
  onInflate: (value: any, item: any) => any;
};

const Mapping: React.FC<MappingProps> = () => null;

Template.displayName = "WishListTemplate";
Mapping.displayName = "WishListMapping";

export const WishList = {
  Component,
  Template,
  Mapping,
};
