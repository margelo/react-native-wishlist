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

## State of WishList

WishList is an archived, read-only repository, and should probably not be used in production. It's a good proof of concept, and a pretty impressive experiment. See [this Notion document](https://margelo.notion.site/WishList-Summit-b20c24d1f0da4889a0513dfa929be5ed?pvs=74) for more details.

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
