import { createItemsDataStructure } from '../WishlistDataCopy';

describe('allow negative indices', () => {
  it('adding new item should change index of old element', () => {
    const wishlistData = createItemsDataStructure([
      { key: 'b', value: 'val1' },
      { key: 'c', value: 'val2' },
    ]);
    const indexOfB = wishlistData.getIndex('b');

    wishlistData.unshift({ key: 'a', value: 'val0' });

    const indexOfBAfterChanges = wishlistData.getIndex('b');
    const indexOfA = wishlistData.getIndex('a');

    expect(indexOfB).toBe(indexOfBAfterChanges);
    expect(indexOfA).toBe(-1);
  });
});
