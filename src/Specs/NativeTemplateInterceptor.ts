import type { ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeTemplateInterceptorProps extends ViewProps {}

export default codegenNativeComponent<NativeTemplateInterceptorProps>(
  'MGTemplateInterceptor',
);
