import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

type HeaderProps = {};

const VITALIK_AVATAR =
  'https://gateway.ipfs.io/ipfs/QmSP4nq9fnN9dAiCj42ug9Wa79rqmQerZXZch82VqpiH7U/image.gif';

export function Header({}: HeaderProps) {
  return (
    <View style={styles.container}>
      <Image style={styles.avatar} source={{ uri: VITALIK_AVATAR }} />
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#9DA0A8',
  },
});
