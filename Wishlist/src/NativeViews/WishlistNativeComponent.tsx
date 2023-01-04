// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// Automatically generated from components_success/COMMANDS_AND_EVENTS_TYPES_EXPORTED.flow.js
// (/react-native/packages/react-native-codegen/src/parsers/flow/components/__test_fixtures__/fixtures.js)

import type {ElementRef} from 'react';
import type {ViewProps} from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent, {
  NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerList();

export type EventInFile = Readonly<{
  value: Double;
}>;

export interface WishlistProps extends ViewProps {
  inflatorId: string;
  initialIndex: number;
  onStartReached?: DirectEventHandler<Readonly<{}>>;
  onEndReached?: DirectEventHandler<Readonly<{}>>;
}

type NativeType = NativeComponentType<WishlistProps>;

export type ScrollToItem = (
  viewRef: ElementRef<NativeType>,
  index: Int32,
  animated: boolean,
) => void;

interface NativeCommands {
  readonly scrollToItem: ScrollToItem;
}

export const WishlistCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToItem'],
});

export default codegenNativeComponent<WishlistProps>('MGWishListComponent');
