import React, { useEffect, useMemo, useRef } from "react";
import { View, Dimensions } from "react-native";
import NativeWishList from "./NativeComponent";
import InflatorRepository from "./InflatorRepository";
import { initEventHandler } from "./EventHandler";

const SCREEN_WIDTH = Dimensions.get("window").width;

function Component(props) {
  const componentsRegistry = useMemo(() => {
    const retVal = new Map<string, React.ReactElement>();
    retVal.set(
      "__offsetComponent",
      <View style={{ height: 0, width: SCREEN_WIDTH }} />
    );
    return retVal;
  }, []);
  initEventHandler();
  const { inflateItem, children } = props;
  const inflatorId = useRef<string | null>(null);
  const mounted = useRef(false);

  if (inflatorId.current == null) {
    inflatorId.current = Math.random().toString();
    InflatorRepository.register(inflatorId.current!, inflateItem);
  }

  const updateChildTemplates = () => {
    // Children changed.
    Array.from(componentsRegistry.keys()).forEach((k) => {
      if (k !== "__offsetComponent") {
        componentsRegistry.delete(k);
      }
    });
    React.Children.forEach(children, (c) => {
      if (c.type.displayName === "WishListTemplate") {
        componentsRegistry.set(
          c.props.type,
          React.Children.only(c.props.children)
        );
      }
    });
  };

  useEffect(
    () => () => {
      inflatorId.current && InflatorRepository.unregister(inflatorId.current);
    },
    []
  );

  if (!mounted.current) {
    updateChildTemplates();
  }

  useEffect(() => {
    if (mounted.current) {
      updateChildTemplates();
    }
    mounted.current = true;
  }, [children]);

  const keys = Array.from(componentsRegistry.keys());

  return (
    <NativeWishList
      {...props}
      removeClippedSubviews={false}
      inflatorId={inflatorId.current}
      kkk={6}
      names={keys}
    >
      {Array.from(componentsRegistry.values()).map((c, i) => (
        <View key={keys[i]}>{c}</View>
      ))}
    </NativeWishList>
  );
}
type TemplateProps = {
  type: string;
  children: React.ReactElement;
};

const Template: React.FC<TemplateProps> = ({ children }) => {
  return children;
};

Template.displayName = "WishListTemplate";

export const WishList = {
  Component,
  Template,
};
