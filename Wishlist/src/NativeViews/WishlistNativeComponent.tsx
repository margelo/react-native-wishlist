// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// Automatically generated from components_success/COMMANDS_AND_EVENTS_TYPES_EXPORTED.flow.js
// (/react-native/packages/react-native-codegen/src/parsers/flow/components/__test_fixtures__/fixtures.js)

import {
  Double,
  Float,
  Int32,
  BubblingEventHandler,
  DirectEventHandler,
} from 'react-native/Libraries/Types/CodegenTypes';
import React from 'react';
import {ViewProps} from 'react-native';
import codegenNativeComponent, { NativeComponentType } from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerList();

export type EventInFile = Readonly<{
  value: Double;
}>;

export interface WishlistProps extends ViewProps {
  reanimatedRuntime: Double,
  inflatorId: string;
  onStartReached: DirectEventHandler<Readonly<{}>>;
  onEndReached: DirectEventHandler<Readonly<{}>>;
}

type NativeType = NativeComponentType<WishlistProps>;

export type ScrollToItem = (viewRef: React.ElementRef<NativeType>, index: Int32, animated: boolean) => void;

interface NativeCommands {
  readonly scrollToItem: ScrollToItem;
}

export const WishlistCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'scrollToItem'
  ],
});

export default (codegenNativeComponent<WishlistProps>('MGWishListComponent'));