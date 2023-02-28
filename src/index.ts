import WishListManager from './Specs/NativeWishlistManager';

WishListManager.install();

export { useTemplateValue, TemplateValue } from './TemplateValue';
export { createTemplateComponent } from './createTemplateComponent';
export { Wishlist, WishListInstance } from './Wishlist';
export {
  useWishlistData,
  useWishlistContextData,
  WishlistData,
} from './WishlistData';
export { createRunInJsFn, createRunInWishlistFn } from './WishlistJsRuntime';
