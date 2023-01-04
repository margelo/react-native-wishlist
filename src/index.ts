import { NativeModules } from 'react-native';

NativeModules.Workaround.install();

export { useTemplateValue } from './TemplateValue';
export { createTemplateComponent } from './createTemplateComponent';
export { WishList } from './WishList';
