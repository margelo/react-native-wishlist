import React, { useEffect, useMemo, useRef } from "react";
import { View, Dimensions, Text } from "react-native";
import NativeWishList from "./NativeViews/NativeWishlistComponent";
import NativeTemplateContainer from "./NativeViews/NativeTemplateContainer";
import NativeTemplateInterceptor from "./NativeViews/NativeTemplateInterceptor";
import InflatorRepository from "./InflatorRepository";
import { initEventHandler } from "./EventHandler";

const TemplateContainer = React.memo(NativeTemplateContainer);
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
      console.log('child', c.type.displayName);
      if (c.type.displayName === "WishListTemplate") {
        componentsRegistry.set(
          c.props.type,
          React.Children.only(c.props.children)
        );
      }
    });
  };

  /*useEffect(
    () => () => {
      console.log('unregister');
      inflatorId.current && InflatorRepository.unregister(inflatorId.current);
    },
    []
  );*/

  
  updateChildTemplates();

  const keys = Array.from(componentsRegistry.keys());

  console.log('keys', keys);
 
  return (
    <NativeTemplateInterceptor inflatorId={inflatorId.current} style={{flex:1}} collapsable={false} removeClippedSubviews={false}>
      <NativeWishList
        style={props.style}
        removeClippedSubviews={false}
        inflatorId={inflatorId.current}
      />
        
      <TemplateContainer names={keys} inflatorId={inflatorId.current} key={Math.random().toString()} collapsable={false} >
        {Array.from(componentsRegistry.values()).map((c, i) => (
            <View key={keys[i]}>{c}</View>
        ))}
      </TemplateContainer>
    </NativeTemplateInterceptor>
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
