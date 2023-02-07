import type * as React from 'react';
import type { ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent, {
  NativeComponentType,
} from 'react-native/Libraries/Utilities/codegenNativeComponent';

export type EventInFile = Readonly<{
  value: Double;
}>;

export interface WishlistProps extends ViewProps {
  inflatorId: string;
  initialIndex: Int32;
  onStartReached?: DirectEventHandler<Readonly<{}>>;
  onEndReached?: DirectEventHandler<Readonly<{}>>;
}

type NativeType = NativeComponentType<WishlistProps>;

export type ScrollToItem = (
  viewRef: React.ElementRef<NativeType>,
  index: Int32,
  animated: boolean,
) => void;

interface NativeCommands {
  readonly scrollToItem: ScrollToItem;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToItem'],
});

export default codegenNativeComponent<WishlistProps>('MGWishlist', {
  interfaceOnly: true,
});
