import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useWorkletCallback } from 'react-native-reanimated';
import { useTemplateValue, WishList, WishList as Wishlist } from 'wishlist';
import { useMarkItemsDirty } from 'wishlist';
import type { ChatItem, ReactionItem } from './Data';

const addReaction = require('./assets/add_reaction.png');

interface Props {
  type: 'me' | 'other';
  onLikeItem: (item: ChatItem) => void;
  onAddReaction: (item: ChatItem) => void;
}

type ReactionItemCombined = ReactionItem & {
  ids: string[];
};

export const Reaction = () => {
  const emoji = useTemplateValue((item: ReactionItemCombined) => {
    return item.emoji;
  });

  const count = useTemplateValue((item: ReactionItemCombined) => {
    return String(item.ids.length);
  });

  const showCounter = useTemplateValue((item: ReactionItemCombined) => {
    return item.ids.length > 1;
  });

  const handler = useWorkletCallback((value, rootValue) => {
    console.log('Touch', value, rootValue);
  }, []);

  return (
    <WishList.Pressable onPress={handler}>
      <View style={styles.reactionItem}>
        <Wishlist.Text style={styles.reactionText}>{emoji}</Wishlist.Text>
        <WishList.IF condition={showCounter}>
          <Wishlist.Text style={styles.reactionCount}>{count}</Wishlist.Text>
        </WishList.IF>
      </View>
    </WishList.Pressable>
  );
};

export const AddReaction = ({
  onAddReaction,
}: {
  onAddReaction: (item: ChatItem) => void;
}) => {
  return (
    <WishList.Pressable onPress={onAddReaction}>
      <View style={styles.reactionItem}>
        <Image style={styles.addReactionImage} source={addReaction} />
      </View>
    </WishList.Pressable>
  );
};

export const ChatItemView: React.FC<Props> = ({
  type,
  onLikeItem,
  onAddReaction,
}) => {
  const author = useTemplateValue((item: ChatItem) => item.author);
  const avatarUrl = useTemplateValue((item: ChatItem) => item.avatarUrl);
  const message = useTemplateValue((item: ChatItem) => item.message);
  const likeText = useTemplateValue((item: ChatItem) => {
    if (global.liked == null) {
      global.liked = {};
    }
    if (global.liked[item.key]) {
      console.log('rerender like');
      return '♥️';
    } else {
      console.log('rerender dislike');
      return '🖤';
    }
    //return item.likes > 0 ? '♥️' : '🖤',
  });
  const likeOpacity = useTemplateValue((item: ChatItem) => {
    if (global.liked == null) {
      global.liked = {};
    }
    if (global.liked[item.key]) {
      return 1;
    } else {
      return 0.4;
    }
    // return item.likes > 0 ? 1 : 0.4,;
  });

  const reactions = useTemplateValue((item: ChatItem) => {
    const obj = item.reactions.reduce((acc, i) => {
      if (acc[i.emoji]) {
        acc[i.emoji].ids.push(i.id);
      } else {
        acc[i.emoji] = { ...i, ids: [i.id] };
      }

      return acc;
    }, {} as Record<string, ReactionItemCombined>);

    return Object.values(obj);
  });

  const mark = useMarkItemsDirty();

  const likeItemListener = useWorkletCallback((value) => {
    console.log('liked', value.key);
    global.liked[value.key] = !(global.liked[value.key] == true);
    mark([value.key]);
  }, []);

  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <Wishlist.Image
          style={styles.avatarImage}
          source={{ uri: avatarUrl }}
        />
        <View style={styles.authorContainer}>
          <Wishlist.Text style={styles.authorText}>{author}</Wishlist.Text>
          {type === 'other' ? (
            <WishList.Pressable onPress={likeItemListener}>
              <Wishlist.Text style={{ opacity: likeOpacity }}>
                {likeText}
              </Wishlist.Text>
            </WishList.Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Wishlist.Text style={styles.messageText}>{message}</Wishlist.Text>
      </View>

      {/*<Wishlist.Template type="reaction">
        <Reaction />
          </Wishlist.Template> */}

      {/*} <View style={styles.reactionsContainer}>
        <Wishlist.ForEach
          style={styles.row}
          items={reactions}
          template="reaction"
        />

        {type === 'other' ? (
          <AddReaction onAddReaction={onAddReaction} />
        ) : null}
        </View> */}
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
  reactionsContainer: {
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  reactionItem: {
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#d6d6d6',
    borderRadius: 8,
    padding: 2,
  },
  reactionText: {
    fontSize: 18,
  },
  reactionCount: {
    fontSize: 13,
    paddingLeft: 2,
    paddingRight: 6,
  },
  reactionRoot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReactionImage: {
    width: 22,
    height: 22,
    tintColor: 'gray',
  },
});
