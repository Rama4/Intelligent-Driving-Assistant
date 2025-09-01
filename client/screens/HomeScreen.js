import {useEffect, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Text, NativeModules} from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import VolumeControl from '../components/VolumeControl';
import FuelInformation from '../components/FuelInformation';
import Button from '../components/shared/Button';
import {sampleApiCall} from '../services/apiService';
import {useSelector, useDispatch} from 'react-redux';
import {selectEmergencyContacts} from '../redux/slices/emergencyContactsSlice';
import {useCallDetector} from '../hooks/useCallDetector';
import emergencyService from '../services/emergencyService';
import {
  updateTrafficCondition,
  updateLegDistances,
  updateLegDurations,
  updateSpeedReadingIntervals,
  updateDestinationDistance,
  updateCurrentSpeed,
  updateDrivingDistance,
  incrementDrivingDistance,
  updateCognitiveWorkload,
  updateDrivingIntervalRef,
  selectDrivingDistance,
  selectCognitiveWorkload,
  selectSpeedReadingIntervals,
  selectDrivingIntervalRef,
} from '../redux/slices/trafficContextSlice';
import {useFocusEffect} from '@react-navigation/native';
import {TrafficConditionType} from '../utils/constants';

const DrivingMoveIntervalms = 2 * 1000;

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
    // Module1.doAsynchronousTask(123, (status, r) => {
    //   console.log('doAsynchronousTask(): status=', status);
    //   console.log('doAsynchronousTask(): r=', r);
    // });
    // startListenerTapped();
    // return () => {
    //   stopListenerTapped();
    // };
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

  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('HomeScreen: _drivingIntervalRef=', _drivingIntervalRef);
  //     if (_drivingIntervalRef) {
  //       const intervalRef = setInterval(() => {
  //         // increment the car distance
  //         dispatch(incrementDrivingDistance());
  //       }, DrivingMoveIntervalms);
  //       dispatch(updateDrivingIntervalRef(intervalRef));
  //     }
  //     () => {
  //       if (_drivingIntervalRef) {
  //         clearInterval(_drivingIntervalRef);
  //         // dispatch(updateDrivingIntervalRef(null));
  //       }
  //     };
  //   }, [_drivingIntervalRef]),
  // );

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
    console.log('onMapsPress button pressed');
    navigation.navigate('MapsScreen');
    // sampleApiCall();
  };

  // const onMapsScreenPress = () => {
  //   console.log('onMapsScreenPress button pressed');
  //   navigation.navigate('MapsScreen');
  //   // sampleApiCall();
  // };

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
            <Button title="Choose Contact" onPress={onChooseContactPress} />
            <Text style={{color: 'black'}}>
              Emergency contact selected:{' '}
              {emergencyContacts !== '' ? emergencyContacts : 'n/a'}
            </Text>
          </View>
          <Button title="go To Voicemails" onPress={onGoToVoicemailsPress} />
        </View>
        {/* <Button title="Respiratory" onPress={onRespPress} /> */}
        {/* <Button
          title="Set Source and Destination"
          onPress={onMapsScreenPress}
        /> */}
        {/* <MapsScreen /> */}
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
    // backgroundColor: 'yellow',
    // height: '100%',
    // minHeight: '100%',
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
