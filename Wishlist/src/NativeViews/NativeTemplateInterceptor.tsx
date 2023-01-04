// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// Automatically generated from components_success/COMMANDS_AND_EVENTS_TYPES_EXPORTED.flow.js
// (/react-native/packages/react-native-codegen/src/parsers/flow/components/__test_fixtures__/fixtures.js)

import {ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
'use strict';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerInterceptor();
export interface NativeTemplateInterceptorProps extends ViewProps {
  inflatorId: string;
}


export default (codegenNativeComponent<NativeTemplateInterceptorProps>('MGTemplateInterceptorComponent'));