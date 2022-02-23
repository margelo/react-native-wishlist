import React from 'react';
import { View, Text } from 'react-native';
import createWishList, { GestureDetector, Gesture } from './WishList';
import Animated, {makeRemote} from 'react-native-reanimated';

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

const emoticons = [
  '🐸', '🧤', '🧢', '👓',
];

const Reactions = ({props}) => {
  'worklet'
  return (

  );
}

const Row = ({props}) => {
  'worklet'

  const singleTap = Gesture.Tap()
  .onStart((item, gestureContext) => {
    'worklet'
    ctx.reactions[gestureContext.index]--;
    item.rerender();
  });

  const doubleTap = Gesture.Tap()
  .onStart((item, gestureContext) => {
    'worklet'
    ctx.reactions[gestureContext.index]++;
    item.rerender();
  });

  const handler = Gesture.Exclusive(doubleTap, singleTap);

  const swipeHandler = Gesture.Pan()
    .onUpdate((e, item) => {
      'worklet'
      item.addProps({
        transform: [
          {translationX: e.translationX}
        ]
      })
    })
    .onEnd((e, item) => {
      'worklet'
      item.addProps({
        transform: [
          {translationX: withSpring(0)}
        ]
      })
    })

  return (
    <GestureDetector gesture={swipeHandler} >
      <Wish.View style={{flexDirection: 'row-reverse'}} >
        <Wish.View style={{margin: 10, width: '70%', backgroundColor: '#00008B'}} >
          <Wish.View style={{margin: 5}} > 
            <Wish.Text style={{color: 'white'}} wishId='author'> me </Wish.Text>
          </View>
          <GestureDetector gesture={handler} >
            <Wish.View style={{margin: 5}}>
              <Wish.Text style={{color: 'white'}} wishId='content'> simple Message </Wish.Text>
            </Wish.View>
          </GestureDetector>
          <Reactions/>
        </Wish.View>
      </Wish.View>
    </GestureDetector>
  );
});

const inflateType = (index, pool, ctx) => {
  'worklet'
  const type = (index % 2) + 1;
  const item = pool.getComponent(`type${type}`);

  const len = SampleText.length;
  const start = Math.floor(Math.random() * len);
  const messageLen = Math.floor(Math.random() * (len - start - 1)) + 1; 
  const newMessage = SampleText.slice(start, start + messageLen);

  if (type === 2) {
    const randomIndex = Math.floor(Math.random() * authors.length);
    const randomAuthor = authors[randomIndex];
    item.View.View.Paragraph.RawText.addProps({text: randomAuthor});
  }

  const reactionView = pool.findById('reactions');
  reactionView.returnAllChildrenToThePool('reaction');
  const newReactions = inflateReactions(index, pool, ctx);
  reactionView.setChildren(newReactions);
  
  item.View.View.at(1).Paragraph.RawText.addProps({text: newMessage});

  return item;
}

export default function App() {
  return (
    <View style={{borderWidth: 4, borderColor: 'purple', flex: 1}}>
      <WishList.Component 
      inflateItem={(index, pool) => {
        'worklet'
        
        if (index < 0 || index > 1000) return undefined;
        return inflateType(index, pool, ctx);
      }}
      style={{flex:1}}/>
    </View>
  );
}