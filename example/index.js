import { AppRegistry } from 'react-native';
import Chat from './src/Chat/ChatExample';
import { AssetListExample } from './src/AssetList/AssetListExample';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => AssetListExample);
