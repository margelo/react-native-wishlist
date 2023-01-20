import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  useTemplateValue,
  Wishlist,
  useWishlistContextData,
} from 'react-native-wishlist';
import type { ChatItem, ReactionItem } from './Data';

const addReaction = require('./assets/add_reaction.png');

interface Props {
  type: 'me' | 'other';
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
    return item.ids.length;
  });

  const showCounter = useTemplateValue(() => {
    return count.value() > 1;
  });

  const handler = (value: any, rootValue: any) => {
    'worklet';

    console.log('Touch', value, rootValue);
  };

  return (
    <Wishlist.Pressable onPress={handler}>
      <View style={styles.reactionItem}>
        <Wishlist.Text style={styles.reactionText}>{emoji}</Wishlist.Text>
        <Wishlist.IF condition={showCounter}>
          <Wishlist.Text style={styles.reactionCount}>{count}</Wishlist.Text>
        </Wishlist.IF>
      </View>
    </Wishlist.Pressable>
  );
};

export const AddReaction = ({
  onAddReaction,
}: {
  onAddReaction: (item: ChatItem) => void;
}) => {
  return (
    <Wishlist.Pressable onPress={onAddReaction}>
      <View style={styles.reactionItem}>
        <Image style={styles.addReactionImage} source={addReaction} />
      </View>
    </Wishlist.Pressable>
  );
};

export const ChatItemView: React.FC<Props> = ({ type, onAddReaction }) => {
  const author = useTemplateValue((item: ChatItem) => item.author);
  const avatarUrl = useTemplateValue((item: ChatItem) => {
    return item.avatarUrl;
  });
  const message = useTemplateValue((item: ChatItem) => item.message);
  const likeText = useTemplateValue((item: ChatItem) => {
    if (item.liked) {
      return '♥️';
    } else {
      return '🖤';
    }
  });
  const likeOpacity = useTemplateValue((item: ChatItem) => {
    if (item.liked) {
      return 1;
    } else {
      return 0.4;
    }
  });

  const reactions = useTemplateValue((item: ChatItem) => {
    const obj = item.reactions.reduce((acc, i) => {
      if (acc[i.emoji]) {
        acc[i.emoji].ids.push(i.key);
      } else {
        acc[i.emoji] = { ...i, ids: [i.key] };
      }

      return acc;
    }, {} as Record<string, ReactionItemCombined>);

    return Object.values(obj);
  });

  const data = useWishlistContextData<ChatItem>();

  const likeItemListener = (value: ChatItem) => {
    'worklet';

    data.update((dataCopy) => {
      const oldValue = dataCopy.get(value.key);
      if (oldValue) {
        oldValue.liked = !oldValue.liked;
        dataCopy.set(value.key, oldValue);
      }
    });
  };

  const toggleImage = (value: ChatItem) => {
    'worklet';

    data.update((dataCopy) => {
      const oldValue = dataCopy.get(value.key);
      if (oldValue) {
        oldValue.showBiggerAvatar = !oldValue.showBiggerAvatar;
        dataCopy.set(value.key, oldValue);
      }
    });
  };

  const avatarSide = useTemplateValue((item: ChatItem) => {
    return item.showBiggerAvatar ? 60 : 30;
  });

  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <Wishlist.Pressable onPress={toggleImage}>
          <Wishlist.Image
            style={[
              styles.avatarImage,
              { width: avatarSide, height: avatarSide },
            ]}
            source={{ uri: avatarUrl }}
          />
        </Wishlist.Pressable>
        <View style={styles.authorContainer}>
          <Wishlist.Text style={styles.authorText}>{author}</Wishlist.Text>
          {type === 'other' ? (
            <Wishlist.Pressable onPress={likeItemListener}>
              <Wishlist.Text style={{ opacity: likeOpacity }}>
                {likeText}
              </Wishlist.Text>
            </Wishlist.Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Wishlist.Text style={styles.messageText}>{message}</Wishlist.Text>
      </View>

      <Wishlist.Template type="reaction">
        <Reaction />
      </Wishlist.Template>

      <View style={styles.reactionsContainer}>
        <Wishlist.ForEach
          style={styles.row}
          items={reactions}
          template="reaction"
        />

        {type === 'other' ? (
          <AddReaction onAddReaction={onAddReaction} />
        ) : null}
      </View>
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
