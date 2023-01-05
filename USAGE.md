# Documentation

WishList uses a **template-based** approach, which is fundamentally different than FlatList's approach.

In a chat app, you might want to have three templates:

* A chat message containing text
* A chat message containing an image
* A system message (e.g. "You have been removed from this group")

Each template is rendered once, and while the user scrolls in the list, the template cells are re-used ("_recycled_") by just moving them around and updating their content.

A chat cell has static properties and template values:

* Static property: The chat room name, the user name
* Template value: The chat message itself, the sender

## The data

In a List, you usually want to render an array of data. Per each item in the array, you want to render one cell in the list.

Data for WishList has to have the following structure:

```ts
type Item = {
  type: string
  key: string
}
```

Where `type` is the predefined template you want to render, and `key` is a unique key to identify a cell.

For the chat app, this might look like this:

```ts
type TextChatMessage = {
  type: 'text-message'
  key: string
  sender: User
  text: string
}
type ImageChatMessage = {
  type: 'image-message'
  key: string
  sender: User
  imageUrl: string
}
type SystemChatMessage = {
  type: 'system-message'
  key: string
  text: string
}

type ChatMessage =
  | TextChatMessage
  | ImageChatMessage
  | SystemChatMessage
type Data = ChatMessage[]
```

WishList provides a `useData` hook to imperatively update the data synchronously, which is usefuly for loading data as you scroll.

## The List

The list component itself is the parent of all content cells, and can be styled and configured to match your needs.

```jsx
function ChatRoom({ room }) {
  return (
    <Wishlist.Component
      style={styles.list}
      initialIndex={room.messages.length - 1} // aka inverted
      initialData={room.messages}
      ref={ref}>
      <Wishlist.Template type="text-message">
        <TextMessageCell roomName={room.name} />
      </Wishlist.Template>
      <Wishlist.Template type="image-message">
        <ImageMessageCell roomName={room.name} />
      </Wishlist.Template>
      <Wishlist.Template type="system-message">
        <SystemMessageCell roomName={room.name} />
      </Wishlist.Template>
    </Wishlist.Component>
  )
}
```

## The Cells

Because WishList uses cell recycling, a cell is only _rendered_ once. WishList then uses that render result of a cell (the **template**) to move it around and update the content of the template as the user scrolls.

This means, that the React component's render function (e.g. `<TextMessageCell>`) is only called once to build the template, and the content itself is then updated through a custom update pipeline.

The custom update pipeline is ran fully on the UI Thread using Worklets.

For example, in **FlatList** you would have the following cell:

```jsx
function TextMessageCell(message: TextChatMessage) {
  return (
    <View style={styles.cell}>
      <Text style={styles.username}>
        {message.sender.username}
      </Text>
    </View>
  )
}
```

Where `message` is a template-value, and the Text's content (`message.sender.username`) is a derived template-value.

In FlatList, the cell's render function gets called every time, whereas in WishList it only gets called once for the template.

To build the same cell in WishList, you would write the following:

```jsx
function TextMessageCell() {
  const username = useTemplateValue<TextChatMessage>(message => message.sender.username)

  return (
    <View style={styles.cell}>
      <WishList.Text style={styles.username}>
        {username}
      </WishList.Text>
    </View>
  )
}
```

In this case, `username` is a Proxy that holds the JSI HostObject, which is synchronized across threads.

We need to use `<WishList.Text>` instead of `<Text>` so that the update pipeline is able to imperatively update it's content on the UI Thread.

### Components

For template-values, you need to use components that are able to update content directly;

* `<WishList.View>` instead of `<View>`
* `<WishList.Text>` instead of `<Text>`
* `<WishList.Image>` instead of `<Image>`
* `<WishList.Pressable>` instead of `<Pressable>`

### Conditionals

Since the React component is only rendered once, conditionals in the render tree won't work.

In **FlatList**, you might have an inline conditional:

```jsx
function TextMessageCell(message) {
  return (
    <View style={styles.cell}>
      {message.isSender && (<DeleteButton />)}

      ...
    </View>
  )
}
```

Wheras in **WishList** you'd have to use a template-value so it can update on the UI Thread without having to do a re-render:

```jsx
function TextMessageCell() {
  const isSender = useTemplateValue<TextChatMessage>(message => message.isSender)

  return (
    <View style={styles.cell}>
      <WishList.If value={isSender}>
        <DeleteButton />
      </WishList.If>

      ...
    </View>
  )
}
```

WishList also provides `<WishList.Switch>` and `<WishList.Case>` for inline switch/cases.

### Loops

As with conditionals, this also goes for loops - instead of a `{data.map((d) => ...)}`, you'd use `<WishList.ForEach>`.

### Callbacks

Since we are running on the UI Thread, we need to hop Threads for callbacks.

In **FlatList**, an `onPress` callback might look like this:

```jsx
function ChatRoom() {
  const onChatPressed = useCallback((item: ChatItem) => {
    console.log(`Pressed message #${item.key}!`)
  }, [])

  const renderItem = useCallback(({ item }) => {
    return <ChatCell onPress={() => onChatPressed(item)} ... />
  })

  return (
    <FlatList renderItem={renderItem} {...listProps} />
  )
}

function ChatCell({ onChatPressed }) {
  return (
    <Pressable onPress={onChatPressed}>
      ...
    </Pressable>
  )
}
```

For **WishList**, the above code can be roughly translated to this:

```jsx
function ChatRoom() {
  const onChatPressed = useCallback((item: ChatItem) => {
    console.log(`Pressed message #${item.key}!`)
  }, [])

  const onChatPressedCallback = createRunInJsFn(onChatPressed)

  return (
    <WishList.Component {...listProps}>
      <WishList.Template type="text-message">
        <ChatCell onChatPressed={onChatPressedCallback} />
      </WishList.Template>
    </WishList.Component>
  )
}

function ChatCell({ onChatPressed }: ChatCellProps) {
  return (
    <WishList.Pressable onPress={onChatPressed}>
      ...
    </WishList.Pressable>
  )
}
```
