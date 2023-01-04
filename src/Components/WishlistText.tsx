import { Text } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';

export const WishlistText = createTemplateComponent(Text, (item, props) => {
  'worklet';

  const { children, ...other } = props;
  const value = typeof children === 'string' ? children : children.toString();
  item.RawText?.addProps({ text: value });
  item.addProps(other);
});
