import React from 'react';
import {View, Text, Image, Button} from 'react-native';
import {WishList} from 'Wishlist';

const SampleText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
It has survived not only five centuries, but also the leap into electronic typesetting, 
remaining essentially unchanged. 
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

const authors = ['John', 'Bob', 'Szymon', 'Marc', 'Elon Musk'];

const Type: React.FC<{}> = () => {
  return (
    <View>
      <View style={{margin: 10, width: '70%', backgroundColor: '#6495ED'}}>
        <Image
          style={{width: 100, height: 100}}
          nativeID="image"
          source={{
            uri: 'https://picsum.photos/100',
          }}
        />
        <View style={{margin: 5}}>
          <Text style={{color: 'white'}} nativeID="author">
            author
          </Text>
        </View>
        <View style={{margin: 5}}>
          <Text style={{color: 'white'}} nativeID="content">
            simple Message
          </Text>
        </View>
        <View>
          <Button title="click me" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <View style={{borderWidth: 4, borderColor: 'purple', flex: 1}}>
      {
        <WishList.Component
          inflateItem={(index, pool) => {
            'worklet';
            if (index < 0 || index > 1000) {
              return undefined;
            }
            let imgSource = 'https://picsum.photos/seed/picsumme/100';

            const type = (index % 2) + 1;
            const item = pool.getComponent(`type${type}`);

            const len = SampleText.length;
            const start = Math.floor(Math.random() * len);
            const messageLen =
              Math.floor(Math.random() * (len - start - 1)) + 1;
            const newMessage = SampleText.slice(start, start + messageLen);

            if (type === 2) {
              const randomIndex = Math.floor(Math.random() * authors.length);
              const randomAuthor = authors[randomIndex];
              const authorView = item.getByWishId('author');
              authorView.RawText.addProps({text: randomAuthor});
              console.log(authorView.describe());
              imgSource = `https://picsum.photos/seed/picsum${authors[randomIndex]}/100`;

              const button = item.getByWishId('button');
              if (button) {
                button.addProps({pointerEvents: 'box-only'});
                button.setCallback('touchEnd', () => {
                  console.log('touched', index, newMessage);
                });
              } else {
                console.log('Button not found - TODO: nativeId for button');
              }
            }

            const contentView = item.getByWishId('content');
            contentView.RawText.addProps({text: newMessage});

            const imageView = item.getByWishId('image');
            imageView.addProps({source: {uri: imgSource}});
            imageView.setCallback('loadEnd', () => {
              // modify data
              // console.log('loadEvent' + index);
            });

            return item;
          }}
          style={{flex: 1}}>
          <WishList.Template type="type1">
            <View style={{flexDirection: 'row-reverse'}}>
              <View
                style={{margin: 10, width: '70%', backgroundColor: '#00008B'}}>
                <Image
                  style={{width: 100, height: 100}}
                  nativeID="image"
                  source={{
                    uri: 'https://picsum.photos/100',
                  }}
                />
                <View style={{margin: 5}}>
                  <Text style={{color: 'white'}} nativeID="author">
                    me
                  </Text>
                </View>
                <View style={{margin: 5}}>
                  <Text style={{color: 'white'}} nativeID="content">
                    simple Message
                  </Text>
                </View>
              </View>
            </View>
          </WishList.Template>
          <WishList.Template type="type2">
            <Type />
          </WishList.Template>
        </WishList.Component>
      }
    </View>
  );
}
