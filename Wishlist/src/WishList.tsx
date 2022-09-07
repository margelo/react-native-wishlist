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
  inflateItem: (index: number, pool: TemplateRegistry) => React.ReactElement;
};

const Component: React.FC<Props> = ({ inflateItem, children, style }) => {
  const { width } = useWindowDimensions();
  useMemo(() => initEventHandler(), []);

  const templatesRef = useRef<{ [key: string]: React.ReactElement }>({});
  const inflatorIdRef = useRef<string | null>(null);
  const prevInflatorRef = useRef<typeof inflateItem>();

  // Inflator registration and tracking
  useMemo(() => {
    if (prevInflatorRef.current !== inflateItem) {
      // Unregister?
      if (inflatorIdRef.current) {
        InflatorRepository.unregister(inflatorIdRef.current);
      }
      // Register
      inflatorIdRef.current = (InflatorId++).toString();
      InflatorRepository.register(inflatorIdRef.current, inflateItem);
    }
  }, [inflateItem]);

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
