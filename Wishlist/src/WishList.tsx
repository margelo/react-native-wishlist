import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, ViewProps, useWindowDimensions } from "react-native";
import NativeWishList from "./NativeViews/NativeWishlistComponent";
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

type TemplateRegistry = {
  getComponent: (type: string) => any;
};

type Props = ViewProps & {
  inflateItem?: (index: number, pool: TemplateRegistry) => React.ReactElement;
  onItemNeeded?: (index: number) => any;
  mapping?: { [key: string]: (value: any, item: any) => void };
};

const Component: React.FC<Props> = ({
  inflateItem,
  mapping,
  onItemNeeded,
  children,
  style,
}) => {
  const { width } = useWindowDimensions();
  useMemo(() => initEventHandler(), []);

  if (
    inflateItem === undefined &&
    (mapping === undefined || onItemNeeded === undefined)
  ) {
    throw Error("Either inflateItem or mapping / onItemNeeded must be defined");
  }

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

      Object.keys(mapping!).forEach((key) => {
        const templateItem = item.getByWishId(key);
        if (templateItem) {
          try {
            mapping![key](value, templateItem);
          } catch (err) {
            console.error(err);
          }
        }
      });
      return item;
    };
  }, [inflateItem, mapping, onItemNeeded]);

  const templatesRef = useRef<{ [key: string]: React.ReactElement }>({});
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

  // Template registration and tracking
  useMemo(() => {
    templatesRef.current = getTemplatesFromChildren(children, width);
  }, [children, width]);

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
};

type TemplateProps = {
  type: string;
  children: React.ReactElement;
};

const Template: React.FC<TemplateProps> = ({ children }) => {
  console.log("**** Render Template");
  return children;
};

Template.displayName = "WishListTemplate";

export const WishList = {
  Component,
  Template,
};
