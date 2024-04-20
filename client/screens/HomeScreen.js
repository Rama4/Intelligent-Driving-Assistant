import {useEffect, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Text, NativeModules} from 'react-native';
import AudioPlayerContainer from '../components/AudioPlayerContainer';
import VolumeControl from '../components/VolumeControl';
import FuelInformation from '../components/FuelInformation';
import Button from '../components/shared/Button';
import {sampleApiCall} from '../services/apiService';
import {useSelector, useDispatch} from 'react-redux';
import {selectEmergencyContacts} from '../redux/slices/emergencyContactsSlice';
import {useCallDetector} from '../hooks/useCallDetector';
import emergencyService from '../services/emergencyService';
import {
  selectDrivingDistance,
  selectSpeedReadingIntervals,
  selectDrivingIntervalRef,
} from '../redux/slices/trafficContextSlice';
import {TrafficConditionType} from '../utils/constants';

export default function HomeScreen({navigation}) {
  const {Module1, Module2} = NativeModules;
  const dispatch = useDispatch();

  const emergencyContacts = useSelector(selectEmergencyContacts);
  const {startListenerTapped, stopListenerTapped} = useCallDetector();
  const {collisionDetected} = emergencyService();
  const _drivingIntervalRef = useSelector(selectDrivingIntervalRef);
  const _drivingDistance = useSelector(selectDrivingDistance);
  const _speedReadingIntervals = useSelector(selectSpeedReadingIntervals);

  useEffect(() => {
    startListenerTapped();
    () => {
      stopListenerTapped();
    };
    Module2?.foo();
    Module1?.foo();
  }, []);

  const _getTrafficConditionFromCache = currentDistance => {
    const tc =
      _speedReadingIntervals.find(interval => {
        if (
          currentDistance >= interval.startPolylinePointIndex &&
          currentDistance < interval.endPolylinePointIndex
        ) {
          return interval;
        }
      })?.speed || TrafficConditionType.SPEED_UNSPECIFIED;
    console.log('_getTrafficConditionFromCache()', 'trafficCondition=', tc);
    return tc;
  };

  useEffect(() => {
    console.log('HomeScreen: _drivingDistance=', _drivingDistance);
    // get traffic condition for current distance
    // set lcw/hcw based on the traffic condition
    _getTrafficConditionFromCache(_drivingDistance);
  }, [_drivingDistance]);

  const onTestPress = () => {
    console.log('test button pressed');
    sampleApiCall();
  };

  const onChooseContactPress = () => {
    console.log('onChooseContactPress button pressed');
    navigation.navigate('ContactsList');
    // sampleApiCall();
  };

  const onGoToVoicemailsPress = () => {
    console.log('onGoToVoicemailsPress button pressed');
    navigation.navigate('VoiceMessageDisplayScreen');
  };

  const onRespPress = () => {
    console.log('onRespPress button pressed');
    navigation.navigate('RespiratorySensor');
    // sampleApiCall();
  };

  const onMapsPress = () => {
    console.log('HomeScreen: onMapsPress button pressed');
    navigation.navigate('MapsScreen');
    // sampleApiCall();
  };

  return (
    <ScrollView>
      <View style={styles.view}>
        <Text style={styles.text}>Smart driving assistant</Text>
        <Button title="Driving Trip Dashboard" onPress={onMapsPress} />
        <View
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
            justifyContent: 'space-around',
            flexDirection: 'row',
            paddingTop: 30,
          }}>
          <View style={styles.column}>
            <Button
              title="Choose emergency contact"
              onPress={onChooseContactPress}
            />
            <Text style={{color: 'black'}}>
              Emergency contact selected:{' '}
              {emergencyContacts !== '' ? emergencyContacts : 'n/a'}
            </Text>
          </View>
          <Button title="Voicemails" onPress={onGoToVoicemailsPress} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
  },
  column: {
    flexDirection: 'column',
    flex: 1,
    paddingHorizontal: 5,
  },
  homeButtonsContainer: {
    flex: 1,
    // backgroundColor: 'red',
    marginTop: 15,
  },
  container: {
    flex: 1,
    padding: 24,
    // backgroundColor: '#fff',
  },
  rowContainer: {
    // flex: 1,
    // width
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
});
