import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {ChatItem} from './Data';
import {WishList} from 'wishlist';

const {Template} = WishList;

interface Props {
  type: 'me' | 'other';
  item: ChatItem;
}

export const ChatItemView: React.FC<Props> = ({type, item}) => {
  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <Template.Image
          style={styles.avatarImage}
          nativeID="avatar"
          source={{uri: item.avatarUrl}}
        />
        <View style={styles.authorContainer}>
          <Template.Text style={styles.authorText}>{item.author}</Template.Text>
          {type === 'other' ? (
            <View nativeID="likeButton">
              <Text nativeID="likes">❤️</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Template.Text style={styles.messageText}>{item.message}</Template.Text>
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
