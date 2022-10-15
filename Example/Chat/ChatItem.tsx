import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {ChatItem, ReactionItem} from './Data';
import {WishList} from 'wishlist';
import {useTemplateValue} from 'wishlist';

const {Template} = WishList;

interface Props {
  type: 'me' | 'other';
  item: ChatItem;
}

export const Reaction = () => {
  const emoji = useTemplateValue((item: ReactionItem) => {
    'worklet';

    return item.emoji;
  });

  return <Template.Text>{emoji}</Template.Text>;
};

const Content = () => {
  const message = useTemplateValue((item: ChatItem) => {
    'worklet';

    return item.message;
  });
  return (
    <View style={styles.messageContainer}>
      <Template.Text style={styles.messageText}>{message}</Template.Text>
    </View>
  );
};

export const ChatItemView: React.FC<Props> = ({type}) => {
  const {author, reactions, likeText, likeOpacity} = useTemplateValues(
    (item: ChatItem) => ({
      author: item.author,
    }),
  );
  const reactions = useTemplateValue((item: ChatItem) => item.reactions);
  const likeText = useTemplateValue((item: ChatItem) =>
    item.likes > 0 ? '♥️' : '🖤',
  );
  const likeOpacity = useTemplateValue((item: ChatItem) =>
    item.likes > 0 ? 1 : 0.4,
  );

  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <ForEach items={reactions} template="reaction" />
        <Template.Image
          style={styles.avatarImage}
          source={{uri: item.avatarUrl}}
        />
        <View style={styles.authorContainer}>
          <Template.Text style={styles.authorText}>{author}</Template.Text>
          {type === 'other' ? (
            <View nativeID="likeButton">
              <Template.Text style={{opacity: likeOpacity}}>
                {likeText}
              </Template.Text>
            </View>
          ) : null}
        </View>
      </View>
      <Content />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    width: '70%',
    borderRadius: 10,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: '#A4A5EF',
  },
  other: {
    backgroundColor: '#EFEFEF',
  },
  imageAndAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 6,
    flex: 1,
  },
  authorText: {
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 6,
  },
  messageText: {},
});
