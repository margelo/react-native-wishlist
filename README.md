# react-native-wishlist

The fastest List component for React Native.


```jsx
function ChatRoom({ room }) {
  return (
    <Wishlist.Component data={room.messages}>
      <Wishlist.Template type="text-message">
        <TextMessageCell />
      </Wishlist.Template>
      <Wishlist.Template type="image-message">
        <ImageMessageCell />
      </Wishlist.Template>
    </Wishlist.Component>
  )
}
```

## Installation

```sh
yarn add react-native-worklets # still private
yarn add react-native-wishlist
cd ios && pod install
```

## Usage

See [USAGE.md](./USAGE.md)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
