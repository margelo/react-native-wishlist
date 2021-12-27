import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import createWishList from './WishList';

const WishList = createWishList();

const SampleText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
It has survived not only five centuries, but also the leap into electronic typesetting, 
remaining essentially unchanged. 
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

const authors = [
  'John', 'Bob', 'Szymon', 'Marc', 'Elon Musk'
];

WishList.registerComponent("type1", (
  <View style={{flexDirection: 'row-reverse'}} >
    <View style={{margin: 1, width: '70%', backgroundColor: '#00008B'}} >
      <View style={{margin: 5}} > 
        <Text style={{color: 'white'}} wishId='author'> me </Text>
      </View>
      <View style={{margin: 5}}>
        <Text style={{color: 'white'}} wishId='content'> simple Message </Text>
      </View>
    </View>
  </View>
));

WishList.registerComponent("type2", (
  <View>
    <View style={{margin: 1, width: '70%', backgroundColor: '#6495ED'}} >
      <View style={{margin: 5}} > 
        <Text style={{color: 'white'}} wishId='author'> author </Text>
      </View>
      <View style={{margin: 5}}>
        <Text style={{color: 'white'}} wishId='content'> simple Message </Text>
      </View>
    </View>
  </View>
));

export default function App() {

  useEffect(() => {
    let counter = 0;
    const startHeavyWork = async () => {
      while (1) {
        counter++;
      }
    }

    startHeavyWork(); // <- Wishlist can handle that easily. It could be just parsing json or just rerender.
  }, []);

  return (
    <View style={{borderWidth: 4, borderColor: 'purple', flex: 1}}>
      <WishList.Component 
      inflateItem={(index, pool) => {
        'worklet'
        
        if (index > 1000) return undefined;

        const type = (Math.abs(index) % 2) + 1;
        const item = pool.getComponent(`type${type}`);

        const len = SampleText.length;
        const start = Math.floor(Math.random() * len);
        const messageLen = Math.min(Math.floor(Math.random() * (len - start - 1)) + 1, 70); 
        const newMessage = SampleText.slice(start, start + messageLen);

        if (type === 2) {
          const randomIndex = Math.floor(Math.random() * authors.length);
          const randomAuthor = authors[randomIndex];
          item.View.View.Paragraph.RawText.addProps({text: randomAuthor});
        }
        
        item.View.View.at(1).Paragraph.RawText.addProps({text: newMessage});

        return item;
      }}
      style={{flex:1}}/>
    </View>
  );
}