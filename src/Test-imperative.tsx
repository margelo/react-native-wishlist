import React from 'react';
import { View, Text } from 'react-native';
import createWishList, { GestureDetector, Gesture } from './WishList';
import Animated, {makeRemote} from 'react-native-reanimated';

const WishList = createWishList();

const ctx = makeRemote({});

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

WishList.registerComponent("Emoticon", (
  <Text>🐸</Text>
));

WishList.registerComponent("row", (
  <View style={{flexDirection: 'row-reverse'}} >
    <View style={{margin: 10, width: '70%', backgroundColor: '#00008B'}} >
      <View style={{margin: 5}} > 
        <Text style={{color: 'white'}} wishId='author'> me </Text>
      </View>
      <View style={{margin: 5}}>
        <Text style={{color: 'white'}} wishId='content'> simple Message </Text>
      </View>
    </View>
  </View>
));

const Row: React.FC<{}> = () => {
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
      <Wish.View>
        <View style={{margin: 10, width: '70%', backgroundColor: '#6495ED'}} >
          <View wishId="sth" style={{margin: 5}} > 
            <Text style={{color: 'white'}} wishId='author'> author </Text>
          </View>
          <GestureDetector gesture={handler} >
            <Wish.View style={{margin: 5}}>
              <Text style={{color: 'white'}} wishId='content'> simple Message </Text>
            </Wish.View>
          </GestureDetector>
          <Wish.View wishId="reactions" />
        </View>
      </Wish.View>
    </GestureDetector>
  );
};

WishList.registerComponent("row", (
  <Row/>
));

const inflateReactions = (index, pool, ctx) => {
  let numberOfReactions = ctx.reactions[index] || 0;
  numberOfReactions = Math.max(numberOfReactions, 4);
  if (numberOfReactions == 0) {
    return [];
  }

  const res = [];

  for (let i = 0; i < numberOfReactions; ++i) {
    const reaction = pool.getComponent('reaction');
    reaction.Paragraph.RawText.addProps({text: emoticons[numberOfReactions]});
    res.push(reaction);
  }
  return res;
}

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