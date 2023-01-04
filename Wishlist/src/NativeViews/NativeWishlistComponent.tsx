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
'use strict';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerList();

export type EventInFile = Readonly<{
  value: Double;
}>;

export type Boolean = boolean;

export type Int = Int32;

export type Void = void;

export type WishlistProps = Readonly<ViewProps & {
  reanimatedRuntime: Double,
  inflatorId: string;
  onBubblingEventDefinedInline: BubblingEventHandler<EventInFile>;
  onBubblingEventDefinedInlineWithPaperName: BubblingEventHandler<EventInFile, 'paperBubblingEventDefinedInlineWithPaperName'>;
  onDirectEventDefinedInline: DirectEventHandler<EventInFile>;
  onDirectEventDefinedInlineWithPaperName: DirectEventHandler<EventInFile, 'paperDirectEventDefinedInlineWithPaperName'>;
}>;

type NativeType = NativeComponentType<WishlistProps>;

export type ScrollTo = (viewRef: React.ElementRef<NativeType>, y: Int, animated: Boolean) => Void;

interface NativeCommands {
  readonly scrollTo: ScrollTo;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'scrollTo'
  ],
});

export default (codegenNativeComponent<WishlistProps>('MGWishListComponent'));