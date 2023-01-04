import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

type HeaderProps = {
  isLoading: boolean;
};

const avatar = require('./assets/margelo_logo.png');

export function ChatHeader({ isLoading }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left} />
      <View style={styles.center}>
        {!isLoading && <Text style={styles.title}>Margelo.io</Text>}
      </View>
      <View style={styles.right}>
        <View style={[styles.avatarContainer, isLoading && styles.gray]}>
          {!isLoading && (
            <Image style={styles.avatar} resizeMode="contain" source={avatar} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 108,
    paddingTop: 58,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 20,
    height: 20,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gray: {
    backgroundColor: '#9DA0A8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  left: {
    width: 60,
  },
  right: {
    width: 60,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
});
