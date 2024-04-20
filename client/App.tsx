import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RespiratorySensor from './components/RespiratorySensor';
import {Provider} from 'react-redux';
import {store} from './redux/store';
import {PermissionsAndroid} from 'react-native';
import ContactsList from './screens/ContactsList';
import MapsScreen from './screens/MapsScreen';
import VoiceMessageDisplayScreen from './screens/VoiceMessageDisplayScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  async function requestMultiplePermissions() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        // PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        // Add more permissions as needed
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      console.log(granted);
    } catch (err) {
      console.warn(err);
    }
  }

  React.useEffect(() => {
    requestMultiplePermissions();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        {/* <Stack.Navigator initialRouteName="VoiceMessageTestScreen"> */}
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ContactsList" component={ContactsList} />
          <Stack.Screen
            name="MapsScreen"
            component={MapsScreen}
            options={{
              title: 'Driving Trip Dashboard',
            }}
          />
          <Stack.Screen
            name="VoiceMessageDisplayScreen"
            component={VoiceMessageDisplayScreen}
            options={{
              title: 'voice messages list',
            }}
          />
          <Stack.Screen
            name="RespiratorySensor"
            component={RespiratorySensor}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
