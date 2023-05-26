import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeContentContainerProps extends ViewProps {}

export default codegenNativeComponent<NativeContentContainerProps>(
  'MGContentContainer',
  { interfaceOnly: true },
);
