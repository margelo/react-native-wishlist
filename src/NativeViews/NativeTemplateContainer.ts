import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeTemplateContainerProps extends ViewProps {
  inflatorId: string;
  wishlistId: string;
  names: ReadonlyArray<string>;
}

export default codegenNativeComponent<NativeTemplateContainerProps>(
  'MGTemplateContainer',
  { interfaceOnly: true },
);
