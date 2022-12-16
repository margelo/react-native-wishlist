const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@react-native/babel-plugin-codegen'],
    [
      'react-native-worklets/plugin',
      {
        globals: ['_log', '_chronoNow'],
        functionsToWorkletize: [{ name: 'useTemplateValue', args: [0] }],
      },
    ],
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '..', pak.source),
        },
      },
    ],
  ],
};
