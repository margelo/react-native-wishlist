// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// Automatically generated from components_success/COMMANDS_AND_EVENTS_TYPES_EXPORTED.flow.js
// (/react-native/packages/react-native-codegen/src/parsers/flow/components/__test_fixtures__/fixtures.js)

import {ViewProps} from 'react-native-tscodegen-types';
import {HostComponent} from 'react-native-tscodegen-types';
import {codegenNativeComponent} from 'react-native-tscodegen-types';
'use strict';

import {NativeModules} from 'react-native';
NativeModules.Workaround.registerContainer();

export type NativeTemplateContainerProps = Readonly<ViewProps & {
  inflatorId: string;
}>;

type NativeType = HostComponent<NativeTemplateContainerProps>;

export default (codegenNativeComponent<NativeTemplateContainerProps>('MGTemplateContainerComponent') as NativeType);