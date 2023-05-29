import { Platform } from 'react-native';
import { Image } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';

export const WishlistImage = createTemplateComponent(Image, (item, props) => {
  'worklet';
  if (Platform.OS === 'android') {
    const { source, ...rest } = props;
    const src = source != null && !Array.isArray(source) ? [source] : source;
    item.addProps({
      src,
      ...rest,
    });
  } else {
    item.addProps(props);
  }
});
