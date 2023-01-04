/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
console.log('path' + `${__dirname}/../`);

const root = path.resolve(__dirname + '/..');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) =>
          name in target
            ? target[name]
            : path.join(process.cwd(), `node_modules/${name}`),
      },
    ),
  },
  watchFolders: [path.resolve('.'), path.resolve('../Wishlist')],
};
