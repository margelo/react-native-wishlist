import { Text } from 'react-native';
import { createTemplateComponent } from '../createTemplateComponent';

export const WishlistText = createTemplateComponent(Text, (item, props) => {
  'worklet';

  const { children, ...other } = props;
  item.RawText?.addProps({ text: children });
  item.addProps(other);
});
