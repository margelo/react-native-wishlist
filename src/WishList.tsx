import NativeWishList from './NativeComponent';


export default function createWishList() {
  const componentsRegistry = new Map<string, React.Element>();

  function WishList(props) {
    return (
      <WishList names={componentsRegistry.keys()}>
        {componentsRegistry.values()}
      </WishList>
    );
  }

  return {
    Component: WishList,
    registerComponent: (name: string, component: React.Element) => {
      componentsRegistry.set(name, component);
    }
  }
}