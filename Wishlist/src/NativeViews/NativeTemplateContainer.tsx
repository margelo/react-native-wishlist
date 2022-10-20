// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// Automatically generated from components_success/COMMANDS_AND_EVENTS_TYPES_EXPORTED.flow.js
// (/react-native/packages/react-native-codegen/src/parsers/flow/components/__test_fixtures__/fixtures.js)

import type {ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerContainer();
export interface NativeTemplateContainerProps extends ViewProps {
  inflatorId: string;
  names: ReadonlyArray<string>;
}

export default codegenNativeComponent<NativeTemplateContainerProps>(
  'MGTemplateContainerComponent',
);
