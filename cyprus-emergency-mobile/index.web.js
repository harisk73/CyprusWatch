
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for web
AppRegistry.registerComponent('cyprus-emergency-mobile', () => App);

AppRegistry.runApplication('cyprus-emergency-mobile', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
