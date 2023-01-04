import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

interface Props {
  type: 'me' | 'other';
}

export const ChatItemView: React.FC<Props> = ({type}) => {
  return (
    <View style={[styles.container, type === 'me' ? styles.me : styles.other]}>
      <View style={styles.imageAndAuthor}>
        <Image
          style={styles.avatarImage}
          nativeID="avatar"
          source={{
            uri: 'https://picsum.photos/100',
          }}
        />
        <View style={styles.authorContainer}>
          <Text style={styles.authorText} nativeID="author">
            {/*  FIXME: We shouldnt need placeholders - but currently we need'em */}
            Author
          </Text>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText} nativeID="content">
          Simple Message
        </Text>
      </View>

      {/* {type === 'other' ? (
        <View nativeID="button">
          <Button
            title="Like"
            onPress={() => {
              onSelected && onSelected({type, author, message, avatarUrl});
            }}
          />
        </View>
      ) : null} */}
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
    backgroundColor: '#EDEDED',
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
    marginHorizontal: 6,
  },
  authorText: {
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 6,
  },
  messageText: {},
});
