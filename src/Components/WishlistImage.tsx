import { Image, Platform } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';

export const WishlistImage = createTemplateComponent(Image, {
  addProps: (item, props) => {
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
  },
  additionalTemplateProps: [
    'style.borderRadius',
    'style.borderTopLeftRadius',
    'style.borderTopRightRadius',
    'style.borderBottomLeftRadius',
    'style.borderBottomRightRadius',
  ],
});
